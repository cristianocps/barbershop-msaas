namespace BarberShop.Dominio.Enuns
{
    public struct IResponseController
    {
        public enum ResponseJsonTypes
        {
            Success = 0,
            Error = 1,
            Warning = 2,
            Information = 3,
            Notification = 4
        }
    }
}