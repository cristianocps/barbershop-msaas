using BarberShop.Dominio.Interfaces.Base;
using System.Globalization;
using System.Text;
using static BarberShop.Dominio.Enuns.IGroupPolicies;

namespace BarberShop.AbstractFactory
{
    public sealed class StoreRoles : IStoreRoles
    {
        public bool IsAuthorized { get; set; }
        public StoreRoles(IUser user)
        {
            Roles = new List<string>();

            if (user == null)
                return;

            if (user.ClaimsIdentity == null)
                return;

            if (user.ClaimsIdentity.Claims == null)
                return;
            
            var _roles = user.ClaimsIdentity.Claims.Where(x => x.Type.Trim().ToLower(culture: CultureInfo.CurrentCulture).Contains("identity/claims/role")).Select(r => r.Value?.ToString().Trim()).ToList();
            if (_roles.Any())
                foreach (var role in _roles)
                    Roles.Add(role?.ToString()?.Trim()?.ToLower(culture: CultureInfo.CurrentCulture) ?? "");
        }

        #region Hierarquia

        /*
         *  Hierarquia resolve
            Ou seja, se Administrador tiver nível numérico maior que User (e tem), 
            e você está comparando usando >=, então:
            Situação	Resultado
            Você é Administrador	✅ Passa [Authorize(Roles = "...")]
            policy exigido é User (nível menor)	✅ IsInPolicy também libera

        Permite usuários de nível superior acessarem recursos de nível inferior
        Bloqueia usuários de nível inferior tentarem acessar rotas de nível superior
        
         */
        #endregion 

        public bool IsInPolicy(Policy roleName)
        {
            IsAuthorized = false;
            if (Roles == null || !Roles.Any())
                return false;

            int userMaxPolicy = 0;
            int requiredPolicy = (int)roleName;

            foreach (var role in Roles)
            {
                var policy = MapRoleNameToPolicy(role);
                if (policy.HasValue && (int)policy > userMaxPolicy)
                    userMaxPolicy = (int)policy.Value;
            }

            IsAuthorized = userMaxPolicy >= requiredPolicy;
            return IsAuthorized;
        }

        public bool IsInRole(UserRoles roleName)
        {
            IsAuthorized = false;
            var _roleName = roleName.ToString().ToLower(culture: CultureInfo.CurrentCulture);

            IsAuthorized = Roles.Contains(_roleName);
            return IsAuthorized;
        }
        public IList<string> Roles { get; set; } = new List<string>();


        public static string NormalizeString(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            var normalized = input.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var ch in normalized)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                    sb.Append(ch);
            }

            return sb.ToString().ToLowerInvariant();
        }


        private static Policy? MapRoleNameToPolicy(string role)
        {
            var normalized = NormalizeString(role);

            return normalized switch
            {
                "consulta" => Policy.Consulta,
                "usuario" => Policy.Usuario,
                "profissional" => Policy.Profissional,
                "gerente" => Policy.Gerente,
                "admin" => Policy.Admin,
                "desenvolvedor" => Policy.Desenvolvedor,
                _ => null
            };
        }

    }





}