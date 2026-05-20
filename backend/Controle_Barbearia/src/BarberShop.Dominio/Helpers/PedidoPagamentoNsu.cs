using System.Text.RegularExpressions;

namespace BarberShop.Dominio.Helpers
{
    public static partial class PedidoPagamentoNsu
    {
        /// <summary>NSU único por loja: emp-{idEmpresa}-agend-{idAgendamento}</summary>
        public static string Gerar(long idEmpresa, long idAgendamento)
            => $"emp-{idEmpresa}-agend-{idAgendamento}";

        public static (long IdEmpresa, long IdAgendamento) Parse(string orderNsu)
        {
            if (string.IsNullOrWhiteSpace(orderNsu))
                throw new ArgumentException("order_nsu vazio.");

            var m = EmpresaAgendamentoRegex().Match(orderNsu.Trim());
            if (m.Success
                && long.TryParse(m.Groups[1].Value, out var idEmpresa) && idEmpresa > 0
                && long.TryParse(m.Groups[2].Value, out var idAgendamento) && idAgendamento > 0)
                return (idEmpresa, idAgendamento);

            var legacy = orderNsu.Replace("agendamento-", "", StringComparison.OrdinalIgnoreCase).Trim();
            if (long.TryParse(legacy, out var idLegado) && idLegado > 0)
                return (0, idLegado);

            throw new ArgumentException("Identificador de pedido inválido.");
        }

        [GeneratedRegex(@"^emp-(\d+)-agend-(\d+)$", RegexOptions.IgnoreCase)]
        private static partial Regex EmpresaAgendamentoRegex();
    }
}
