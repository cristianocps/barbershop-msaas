namespace BarberShop.Dominio.Helpers
{
    /// <summary>
    /// Horários de agendamento são sempre no fuso da barbearia (Brasil).
    /// O frontend envia datetime-local sem offset; o servidor Docker costuma estar em UTC.
    /// </summary>
    public static class AgendamentoDateTimeHelper
    {
        private static readonly TimeZoneInfo BrazilTz = ResolveBrazilTimeZone();

        private static TimeZoneInfo ResolveBrazilTimeZone()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById(
                    OperatingSystem.IsWindows() ? "E. South America Standard Time" : "America/Sao_Paulo");
            }
            catch
            {
                return TimeZoneInfo.CreateCustomTimeZone("Brazil", TimeSpan.FromHours(-3), "Brazil", "Brazil");
            }
        }

        /// <summary>Converte data/hora informada pelo usuário (horário de Brasília) para UTC no banco.</summary>
        public static DateTime ToStorageUtc(DateTime dt)
        {
            if (dt.Kind == DateTimeKind.Utc)
                return dt;

            var naive = DateTime.SpecifyKind(dt, DateTimeKind.Unspecified);
            return TimeZoneInfo.ConvertTimeToUtc(naive, BrazilTz);
        }

        /// <summary>Início do dia civil (00:00) em Brasília, como UTC.</summary>
        public static DateTime DayStartUtc(DateTime date)
        {
            var day = date.Date;
            var naive = DateTime.SpecifyKind(day, DateTimeKind.Unspecified);
            return TimeZoneInfo.ConvertTimeToUtc(naive, BrazilTz);
        }

        /// <summary>Início do dia seguinte (exclusive) em Brasília, como UTC.</summary>
        public static DateTime NextDayStartUtc(DateTime date)
            => DayStartUtc(date.Date.AddDays(1));

        /// <summary>Para exibição no calendário: horário de Brasília sem offset na serialização JSON.</summary>
        public static DateTime ToBrazilLocal(DateTime dbUtc)
        {
            var utc = dbUtc.Kind == DateTimeKind.Utc
                ? dbUtc
                : DateTime.SpecifyKind(dbUtc, DateTimeKind.Utc);
            return DateTime.SpecifyKind(
                TimeZoneInfo.ConvertTimeFromUtc(utc, BrazilTz),
                DateTimeKind.Unspecified);
        }
    }
}
