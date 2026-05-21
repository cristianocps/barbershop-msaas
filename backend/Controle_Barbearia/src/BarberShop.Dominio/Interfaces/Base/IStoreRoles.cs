using static BarberShop.Dominio.Enuns.IGroupPolicies;

namespace BarberShop.Dominio.Interfaces.Base
{
    public interface IStoreRoles
    {
        public IList<string> Roles { get; set; }
        public void CarregarRolesDoBanco(IEnumerable<string> roleNames);
        public bool IsInPolicy(Policy roleName);
        public bool IsInRole(UserRoles roleName);
        public bool IsAuthorized { get; set; }
    }
}
