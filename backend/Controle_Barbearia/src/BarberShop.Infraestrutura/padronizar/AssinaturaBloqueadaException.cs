using BarberShop.Dominio.Entidade.Reflection.Texto;

namespace BarberShop.Infraestrutura.padronizar
{
    public class AssinaturaBloqueadaException : TratamentoExcecao
    {
        public AssinaturaBloqueadaException(string? message = null)
            : base(message ?? "Pagamento da plataforma em atraso. Regularize para continuar usando o sistema.")
        {
        }
    }
}
