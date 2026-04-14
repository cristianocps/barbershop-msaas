using System.ComponentModel.DataAnnotations;

namespace BarberShop.Models
{
    public class LoginModel
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória")]
        public string Password { get; set; } = string.Empty;
    }

    public class RegistroModel
    {
        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória")]
        [MinLength(6, ErrorMessage = "A senha deve ter pelo menos 6 caracteres")]
        public string Password { get; set; } = string.Empty;

        [Compare("Password", ErrorMessage = "As senhas não conferem")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}
