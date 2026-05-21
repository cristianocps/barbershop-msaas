using BarberShop.Dominio.Interfaces.Repositorios.Plataforma;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace BarberShop.Middleware
{
    public partial class AssinaturaPlataformaMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly string[] WhitelistPrefixes =
        [
            "/api/acessos",
            "/api/webhooks/infinitepay",
            "/api/plataforma/assinatura",
            "/swagger",
            "/health"
        ];

        public AssinaturaPlataformaMiddleware(RequestDelegate next) => _next = next;

        public async Task InvokeAsync(HttpContext context, IPlataformaAssinaturaRepositorio assinaturaRepo)
        {
            var path = context.Request.Path.Value ?? "";

            if (IsWhitelisted(path))
            {
                await _next(context).ConfigureAwait(false);
                return;
            }

            if (context.User.Identity?.IsAuthenticated == true
                && (context.User.IsInRole("Desenvolvedor") || context.User.IsInRole("Cliente")))
            {
                await _next(context).ConfigureAwait(false);
                return;
            }

            var pathLower = path.ToLowerInvariant();
            if (pathLower.StartsWith("/api/portalcliente", StringComparison.Ordinal))
            {
                await _next(context).ConfigureAwait(false);
                return;
            }

            var idEmpresa = await ResolverIdEmpresaAsync(context, assinaturaRepo).ConfigureAwait(false);
            if (idEmpresa is null or <= 0)
            {
                await _next(context).ConfigureAwait(false);
                return;
            }

            if (path.Contains("/api/plataforma/plataformafinanceiro", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context).ConfigureAwait(false);
                return;
            }

            if (await assinaturaRepo.EstaBloqueadaAsync(idEmpresa.Value).ConfigureAwait(false))
            {
                context.Response.StatusCode = StatusCodes.Status402PaymentRequired;
                context.Response.ContentType = "application/json";
                var status = await assinaturaRepo.ObterStatusAsync(idEmpresa.Value).ConfigureAwait(false);
                await context.Response.WriteAsJsonAsync(new
                {
                    blocked = true,
                    status = status.Status,
                    message = status.Mensagem ?? "Pagamento da plataforma em atraso."
                }).ConfigureAwait(false);
                return;
            }

            await _next(context).ConfigureAwait(false);
        }

        private static bool IsWhitelisted(string path)
        {
            var lower = path.ToLowerInvariant();
            if (lower.Contains("/plataforma/assinatura", StringComparison.Ordinal))
                return true;
            return WhitelistPrefixes.Any(p => lower.StartsWith(p, StringComparison.Ordinal));
        }

        private static async Task<long?> ResolverIdEmpresaAsync(HttpContext context, IPlataformaAssinaturaRepositorio repo)
        {
            var path = context.Request.Path.Value ?? "";

            if (path.Contains("/api/Agendamentos/Vitrine", StringComparison.OrdinalIgnoreCase))
                return await ResolverVitrineAsync(context, repo).ConfigureAwait(false);

            var email = context.User.FindFirstValue(ClaimTypes.Email)
                ?? context.User.FindFirstValue(ClaimTypes.Name);
            if (!string.IsNullOrWhiteSpace(email))
                return await repo.ResolverIdEmpresaPorEmailAsync(email).ConfigureAwait(false);

            return null;
        }

        private static async Task<long?> ResolverVitrineAsync(HttpContext context, IPlataformaAssinaturaRepositorio repo)
        {
            var path = context.Request.Path.Value ?? "";

            var slugMatch = EmpresaSlugRegex().Match(path);
            if (slugMatch.Success)
                return await repo.ResolverIdEmpresaPorSlugAsync(slugMatch.Groups[1].Value).ConfigureAwait(false);

            var idMatch = IdEmpresaRouteRegex().Match(path);
            if (idMatch.Success && long.TryParse(idMatch.Groups[1].Value, out var idEmpresa))
                return idEmpresa;

            if (context.Request.Query.TryGetValue("idEmpresa", out var qEmp) && long.TryParse(qEmp, out var idQ))
                return idQ;

            if (context.Request.Query.TryGetValue("idProfissional", out var qProf)
                && long.TryParse(qProf, out var idProf))
                return await ResolverEmpresaPorProfissionalAsync(repo, idProf).ConfigureAwait(false);

            if (context.Request.Method == "POST"
                && path.Contains("confirmar", StringComparison.OrdinalIgnoreCase)
                && context.Request.ContentType?.Contains("json", StringComparison.OrdinalIgnoreCase) == true)
            {
                context.Request.EnableBuffering();
                using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
                var body = await reader.ReadToEndAsync().ConfigureAwait(false);
                context.Request.Body.Position = 0;
                var empMatch = IdEmpresaJsonRegex().Match(body);
                if (empMatch.Success && long.TryParse(empMatch.Groups[1].Value, out var idBody))
                    return idBody;
            }

            return null;
        }

        private static async Task<long?> ResolverEmpresaPorProfissionalAsync(IPlataformaAssinaturaRepositorio repo, long idProfissional)
        {
            return await repo.ResolverIdEmpresaPorProfissionalAsync(idProfissional).ConfigureAwait(false);
        }

        [GeneratedRegex(@"/empresa/([^/]+)", RegexOptions.IgnoreCase)]
        private static partial Regex EmpresaSlugRegex();

        [GeneratedRegex(@"/(?:servicos|profissionais|dados-bancarios)/(\d+)", RegexOptions.IgnoreCase)]
        private static partial Regex IdEmpresaRouteRegex();

        [GeneratedRegex(@"""idEmpresa""\s*:\s*(\d+)", RegexOptions.IgnoreCase)]
        private static partial Regex IdEmpresaJsonRegex();
    }

    public static class AssinaturaPlataformaMiddlewareExtensions
    {
        public static IApplicationBuilder UseAssinaturaPlataforma(this IApplicationBuilder app)
            => app.UseMiddleware<AssinaturaPlataformaMiddleware>();
    }
}
