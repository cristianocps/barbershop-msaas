using BarberShop.Dominio.Enuns;
using System.Diagnostics;
using System.Globalization;

namespace BarberShop.Dominio.Entidade.DTOs
{
    [DebuggerStepThrough]
    public class RetornoGridPaginado<TReturn> where TReturn : class
    {
        public long draw { get; set; } = 1;
        public long recordsTotal { get; set; } = default!;
        public long recordsFiltered { get; set; } = default!;
        public object ExtraInfo { get; set; } = default!;


        public string JsonTypes { get; set; } = default!;
        public IEnumerable<TReturn?> data { get; set; } = default!;

        public RetornoGridPaginado<TReturn> RetornoVazio(int draw)
        {
            return new RetornoGridPaginado<TReturn>
            {
                draw = draw,
                recordsTotal = 0,
                recordsFiltered = 0,
                data = new List<TReturn>(),
                JsonTypes = IResponseController.ResponseJsonTypes.Success.ToString().ToLower(culture: CultureInfo.CurrentCulture)
            };
        }
    }
}
