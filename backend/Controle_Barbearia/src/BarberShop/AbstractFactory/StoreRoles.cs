using BarberShop.Dominio.Interfaces.Base;
using System.Globalization;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using static BarberShop.Dominio.Enuns.IGroupPolicies;

namespace BarberShop.AbstractFactory
{
    public sealed class StoreRoles : IStoreRoles
    {
        public bool IsAuthorized { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();

        public StoreRoles(IUser user)
        {
            if (user == null)
                return;

            var claims = (user.GetClaimsIdentity() ?? Enumerable.Empty<Claim>()).ToList();
            if (claims.Count == 0 && user.ClaimsIdentity?.Claims != null)
                claims = user.ClaimsIdentity.Claims.ToList();

            CarregarRolesDasClaims(claims);
        }

        public void CarregarRolesDoBanco(IEnumerable<string> roleNames)
        {
            Roles.Clear();
            foreach (var role in roleNames)
            {
                var normalized = NormalizeString(role);
                if (!string.IsNullOrEmpty(normalized))
                    Roles.Add(normalized);
            }
        }

        private void CarregarRolesDasClaims(IReadOnlyList<Claim> claims)
        {
            Roles.Clear();

            foreach (var c in claims)
            {
                var t = c.Type.Trim().ToLowerInvariant();
                if (t.Contains("identity/claims/role", StringComparison.Ordinal) || t == "role" || t == "roles")
                {
                    var v = NormalizeString(c.Value ?? "");
                    if (!string.IsNullOrEmpty(v) && !Roles.Contains(v))
                        Roles.Add(v);
                }
            }

            if (Roles.Count > 0)
                return;

            var appRoles = claims.FirstOrDefault(c =>
                string.Equals(c.Type, "app_roles", StringComparison.OrdinalIgnoreCase))?.Value;

            if (string.IsNullOrWhiteSpace(appRoles))
                return;

            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(appRoles);
                if (parsed == null)
                    return;

                foreach (var role in parsed)
                {
                    var v = NormalizeString(role ?? "");
                    if (!string.IsNullOrEmpty(v) && !Roles.Contains(v))
                        Roles.Add(v);
                }
            }
            catch
            {
                // token legado ou claim malformado
            }
        }

        public bool IsInPolicy(Policy roleName)
        {
            IsAuthorized = false;
            if (Roles == null || Roles.Count == 0)
                return false;

            var userMaxPolicy = 0;
            var requiredPolicy = (int)roleName;

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
            var role = NormalizeString(roleName.ToString());
            IsAuthorized = Roles.Contains(role);
            return IsAuthorized;
        }

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
                "cliente" => Policy.Cliente,
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
