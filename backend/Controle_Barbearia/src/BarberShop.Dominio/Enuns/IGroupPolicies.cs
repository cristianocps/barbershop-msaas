namespace BarberShop.Dominio.Enuns
{
    public interface IGroupPolicies
    {
        public enum UserRoles
        {
            Consulta = 1,
            Usuario = 2,
            Profissional = 3,
            Gerente = 4,
            Admin = 5,
            Desenvolvedor = 6
        }

        public enum Policy
        {
            Consulta = 1,
            Usuario = 2,
            Profissional = 3,
            Gerente = 4,
            Admin = 5,
            Desenvolvedor = 6
        }
    }
}
