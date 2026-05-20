using System.Text.RegularExpressions;

namespace BarberShop.Dominio.Helpers
{
    public static partial class PedidoPlataformaNsu
    {
        public static string Gerar(long idEmpresa, long idCobranca)
            => $"plat-emp-{idEmpresa}-cobr-{idCobranca}";

        public static (long IdEmpresa, long IdCobranca) Parse(string orderNsu)
        {
            if (string.IsNullOrWhiteSpace(orderNsu))
                throw new ArgumentException("order_nsu vazio.");

            var m = PlataformaRegex().Match(orderNsu.Trim());
            if (m.Success
                && long.TryParse(m.Groups[1].Value, out var idEmpresa) && idEmpresa > 0
                && long.TryParse(m.Groups[2].Value, out var idCobranca) && idCobranca > 0)
                return (idEmpresa, idCobranca);

            throw new ArgumentException("Identificador de cobrança da plataforma inválido.");
        }

        [GeneratedRegex(@"^plat-emp-(\d+)-cobr-(\d+)$", RegexOptions.IgnoreCase)]
        private static partial Regex PlataformaRegex();
    }
}
