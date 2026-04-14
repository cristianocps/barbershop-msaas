using System.Security.Claims;

namespace BarberShop.Dominio.Interfaces.Base
{
    public interface IUser
    {
        string Name { get; }
        bool IsAuthenticated();
        IEnumerable<Claim> GetClaimsIdentity();
        ClaimsIdentity ClaimsIdentity { get; }
    }
}
