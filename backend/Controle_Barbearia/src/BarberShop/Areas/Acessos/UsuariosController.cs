using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Security.Principal;
using System.Text.Json;
using BarberShop.Controllers;
using static BarberShop.Dominio.Enuns.IGroupPolicies;
using BarberShop.Dominio.Entidade.Acessos;
using BarberShop.Dominio.Entidade.Reflection.Texto;
using static BarberShop.Dominio.Enuns.IResponseController;
using BarberShop.Dominio.Interfaces.Servicos.Acessos;
using BarberShop.Dominio.Entidade.DTOs;
using BarberShop.Dominio.Interfaces.Base;
using BarberShop.Infraestrutura.padronizar;

namespace BarberShop.Areas.Acessos
{
    [Authorize]
    [ApiController]
    [Area("Acessos")]
    [Route("api/[area]/[controller]")]
    public class UsuariosController : BasicController
    {
        private readonly IUsuarioServicos _usuarioServicos;
        public UsuariosController(
            [FromServices] IWebHostEnvironment environment,
            IHttpContextAccessor context,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IUsuarioServicos usuarioServicos,
            IPrincipal principal,
            IUser? user,
            IStoreRoles storeRoles) : base(environment, Policy.Admin, context, configuration, signInManager, userManager, roleManager, principal, user, storeRoles)
        { _usuarioServicos = usuarioServicos; }


        [HttpPost("alterarusuarios")]
        public async Task<JsonResult> AlterarUsuarios(DtoUsuario dados)
        {
            try
            {
                var _email = dados?.Email?.ToLower(culture: CultureInfo.CurrentCulture).Trim() ?? "";
                var _senha = dados?.Senha?.Trim() ?? "";

                if (dados == null)
                    throw new TratamentoExcecao("Objeto vazio");

                var _dados = new Usuario
                {
                    ID = dados.ID,
                    Status = (dados?.Status ?? 0),
                    Cidade = (dados?.Cidade ?? ""),
                    Descricao = (dados?.Descricao ?? ""),
                    Documento = (dados?.Documento ?? ""),
                    DtCriacao = DateTime.Now,
                    Email = _email,
                    Logon = _email,
                    Telefone = (dados?.Telefone ?? ""),
                    IdEmpresa = dados?.IdEmpresa > 0 ? dados.IdEmpresa : base.Identidade.IdEmpresaLogado,
                    IdClains = null,
                    Senha = _senha,
                };

                var _idUsuario = dados?.ID ?? 0;
                var _validarCriacao = await _usuarioServicos.ValidarCriacaoUsuario(_idUsuario, _dados.Email).ConfigureAwait(false);
                if (!string.IsNullOrEmpty(_validarCriacao))
                {
                    throw new Exception(_validarCriacao.Replace('\r', ' ').Replace("\n", "<br />"));
                }

                Thread.CurrentThread.CurrentCulture = CultureInfo.GetCultureInfo("pt-BR");
                var context = new ValidationContext(_dados, serviceProvider: null, items: null);
                var validationResults = new List<ValidationResult>();
                bool isValid = Validator.TryValidateObject(_dados, context, validationResults, true);
                validationResults ??= new List<ValidationResult>();

                if (!isValid)
                {
                    var _validSenha = validationResults?.Where(x => x?.MemberNames?.FirstOrDefault()?.ToLower(culture: CultureInfo.CurrentCulture) == "senha")?.FirstOrDefault();
                    if ((dados?.ID ?? 0) != 0 && _validSenha != null)
                        validationResults?.Remove(_validSenha);
                }

                validationResults ??= new List<ValidationResult>();

                if (validationResults.Any())
                {
                    var _erroMensagem = (validationResults?.FirstOrDefault()?.ErrorMessage ?? "Erro no processamento").ToLower(culture: CultureInfo.CurrentCulture);
                    throw new TratamentoExcecao(_erroMensagem.Traduzir());
                }

                var user = new IdentityUser();
                if ((dados?.ID ?? 0) == 0)
                {
                    var _securitystamp = Guid.NewGuid().ToString().ToLower(culture: CultureInfo.CurrentCulture);
                    var _concurrencystamp = Guid.NewGuid().ToString().ToLower(culture: CultureInfo.CurrentCulture);

                    user = new IdentityUser
                    {
                        UserName = _email,
                        NormalizedUserName = _email,
                        Email = _email,
                        NormalizedEmail = _email,
                        EmailConfirmed = true,
                        SecurityStamp = _securitystamp,
                        ConcurrencyStamp = _concurrencystamp,
                        PhoneNumber = null,
                        PhoneNumberConfirmed = false,
                        TwoFactorEnabled = false,
                        LockoutEnd = null,
                        LockoutEnabled = false,
                        AccessFailedCount = 0
                    };

                    if (UserManager == null)
                        throw new TratamentoExcecao("Erro de criação de usuários");

                    var _create = await UserManager.CreateAsync(user, _senha).ConfigureAwait(false);
                    if (!_create.Succeeded)
                        throw new TratamentoExcecao(_create?.Errors?.FirstOrDefault()?.Description ?? "");
                }
                else
                {
                    if (UserManager == null)
                        throw new TratamentoExcecao("Erro de alteração de usuários");

                    user = await UserManager.FindByNameAsync(_email).ConfigureAwait(false);
                    user ??= await UserManager.FindByEmailAsync(_email).ConfigureAwait(false);

                    if (user == null)
                        throw new TratamentoExcecao("Erro a localização para alteração do usuário");
                }
                if (!string.IsNullOrWhiteSpace(dados?.IdClains))
                {
                    var roles = await UserManager.GetRolesAsync(user);

                    if (roles.Any()) { await UserManager.RemoveFromRolesAsync(user, roles); }

                    var role = await base.RoleManager!.FindByIdAsync(dados.IdClains);
                    if (role != null)
                    {
                        await base.UserManager.AddToRoleAsync(user, role.Name ?? "");
                    }
                }

                _dados.IdClains = user.Id;

                await _usuarioServicos.AlterarUsuarios(_dados);

                return await ResponseJson(ResponseJsonTypes.Success);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }


        [HttpPost("carregargrid-usuarios")]
        public async Task<IActionResult> CarregarGridUsuarios(DataTableSearch? search = null, int start = 0, int length = 0, int draw = 0)
        {
            try
            {
                search ??= new DataTableSearch
                {
                    value = "",
                };

                var _result = Json(await _usuarioServicos.CarregarGridUsuarios(search, start, draw, length), new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_result).ConfigureAwait(false);

            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }

        }

        [HttpGet("carregarcombo-usuarios")]
        public async Task<IActionResult> CarregarComboUsuarios(string? search, int? page)
        {
            try
            {
                var _page = page ?? 1;
                var _message = "";
                var _type = ResponseJsonTypes.Success;
                var _result = await _usuarioServicos.CarregarComboUsuarios(search ?? "", _page);
                var _return = await ResponseJson(_type, _message, _result, _result.Count()).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }

        }

        [HttpPost("editar-usuarios")]
        public async Task<JsonResult> Editar(long idItem)
        {
            try
            {
                var _result = await _usuarioServicos.Editar(idItem);
                var _return = await ResponseJson(ResponseJsonTypes.Success, "", _result).ConfigureAwait(false);

                return await Task.FromResult(_return).ConfigureAwait(false);
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }


        [HttpPost("inativar-usuarios")]
        public async Task<JsonResult> InativarUsuarios(long idItem)
        {
            try
            {
                var _atuais = await _usuarioServicos.Editar(idItem);

                if (_atuais == null)
                    throw new TratamentoExcecao("Usuário não encontrado.");

                if (UserManager != null && !string.IsNullOrEmpty(_atuais.Email))
                {
                    var identityUser = await UserManager.FindByEmailAsync(_atuais.Email).ConfigureAwait(false);
                    if (identityUser != null)
                    {
                        identityUser.EmailConfirmed = false;

                        var updateResult = await UserManager.UpdateAsync(identityUser);
                        if (!updateResult.Succeeded)
                            throw new TratamentoExcecao("Erro ao inativar acesso no Identity.");
                    }
                }

                var _dados = new Usuario
                {
                    ID = _atuais.ID,
                    Status = 0,
                    Cidade = _atuais.Cidade ?? "",
                    Descricao = _atuais.Descricao ?? "",
                    Documento = _atuais.Documento ?? "",
                    DtCriacao = _atuais.DtCriacao,
                    Email = _atuais.Email ?? "",
                    Logon = _atuais.Logon ?? "",
                    Telefone = _atuais.Telefone ?? "",
                    IdEmpresa = base.Identidade.IdEmpresaLogado,
                    IdClains = _atuais.IdClains,
                    Senha = _atuais.Senha ?? ""
                };

                await _usuarioServicos.AlterarUsuarios(_dados);

                return await ResponseJson(ResponseJsonTypes.Success, "Usuário inativado e acesso bloqueado com sucesso!");
            }
            catch (TratamentoExcecao e) { return await ResponseJson(ResponseJsonTypes.Error, e.Message); }
            catch (Exception ex) { return await ResponseJson(ResponseJsonTypes.Error, ex.Message); }
        }


    }
}
