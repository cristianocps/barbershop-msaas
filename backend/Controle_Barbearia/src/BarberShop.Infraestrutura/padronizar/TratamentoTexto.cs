using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace BarberShop.Infraestrutura.padronizar
{
    [DebuggerStepThrough]
    public static class TratamentoTexto
    {
        public static string StringToBase64(this string texto) =>
            System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(texto ?? ""));
        public static string Base64ToString(this string texto) =>
            System.Text.Encoding.UTF8.GetString(System.Convert.FromBase64String(texto ?? ""));
        public static string ApenasNumeros(this string texto)
        {
            texto ??= "";
            //string pattern = @"(?i)[^0-9a-záéíóúàèìòùâêîôûãõç\s]";
            string pattern = @"(?i)[^0-9\s]";
            string replacement = "";
            Regex rgx = new Regex(pattern);
            return rgx.Replace(texto, replacement);
        }

        public static string AjusteFieldLength(this string texto, int maxLength)
        {
            if (maxLength == 0)
                maxLength = 1;

            var _texto = (texto ?? "").RemoveAccents().PadRight(maxLength, ' ').Substring(0, maxLength).Trim();
            return _texto;
        }
        public static string RemoveAccents(this string text, bool RetirarMascaras = false)
        {
            if (text == null)
                return "";

            StringBuilder sbReturn = new StringBuilder();
            var arrayText = text.Normalize(NormalizationForm.FormD).ToCharArray();
            foreach (char letter in arrayText)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(letter) != UnicodeCategory.NonSpacingMark)
                    sbReturn.Append(letter);
            }
            if (RetirarMascaras)
                return (sbReturn?.ToString()?.RetirarMascaraDocumento()?.Replace("'", "") ?? "").Trim();
            else
                return (sbReturn?.ToString()?.Replace("'", "") ?? "").Trim();
        }
        public static string RetirarCaracterEspecial(this string texto)
            => Regex.Replace(texto, @"[^0-9a-zA-ZéúíóáÉÚÍÓÁèùìòàÈÙÌÒÀõãñÕÃÑêûîôâÊÛÎÔÂëÿüïöäËYÜÏÖÄçÇ.\s]+?", string.Empty);
        public static object RetirarMascaraDocumento(this object texto) => (texto ?? "")?.ToString()?.RetirarMascaraDocumento() ?? "";
        public static string RetirarMascaraDocumento(this string texto)
            => (texto ?? "")
                .Replace(".", "")
                .Replace("-", "")
                .Replace("/", "")
                .Replace("_", "")
                .Replace("(", "")
                .Replace(")", "")
                .Replace("'", "")
                .Replace(",", "")
                .Replace(":", "")
                .Replace('\n', ' ')
                .Replace('\r', ' ')
                .Replace('\t', ' ')
                .Replace(" ", "")
                .Trim();

        public static string VarcharToSQL(this string texto)
            => (texto ?? "")
            .Replace("'", "")
            .Replace(" go ", "")
            .Replace(" GO ", "")
            .Replace(" gO ", "")
            .Replace(" Go ", "")
            .Trim();


        public static string VarcharSQL(this string texto)
            => (texto ?? "").Replace("'", ".")
            .Trim();


        public static string DatatimeToSQL(this DateTime? texto)
            => (texto ?? new DateTime(1900, 1, 1)).ToString("yyyy-MM-dd HH:mm:ss.fff").Trim(); 
        
        public static string DatatimeNovoToSQL(this DateTime? texto)
            => (texto ?? new DateTime(1, 1, 1900)).ToString("dd-MM-yyyy").Trim();

        private static string LimparString(this string texto) => texto
            .RetirarMascaraDocumento()
            .Trim();
        public static bool IsNumber(this string texto) => string.IsNullOrEmpty(texto.LimparString()) ? false : (!texto.LimparString().ToCharArray().Where(x => !char.IsNumber(x)).ToList().Any() ? true : false);

        public static bool IsNumber(this object texto)
        {
            var _texto = texto?.ToString()
                ?.Replace('\r', ' ')
                ?.Replace('\n', ' ')
                ?.Replace('\t', ' ')
                ?.Replace('.', ' ')
                ?.Replace(',', ' ')
                ?.Replace(" ", "")
                ?.RetirarMascaraDocumento()
                ?.Trim();

            if (string.IsNullOrEmpty(_texto))
                return false;

            var digitos = _texto.ToCharArray();
            foreach (var digito in digitos)
            {
                if (!Char.IsNumber(digito))
                {
                    return false;
                }
            }
            return true;
        }





        public static bool IsCpf(this string cpf)
        {
            if (cpf == null)
                return false;

            if (string.IsNullOrEmpty(cpf))
                return false;

            if (!cpf.RetirarMascaraDocumento().IsNumber())
                return false;

            cpf = cpf.Trim().PadLeft(11, '0');
            if(cpf == "00000000000" 
                || cpf == "11111111111"
                || cpf == "22222222222"
                || cpf == "33333333333"
                || cpf == "44444444444"
                || cpf == "55555555555"
                || cpf == "66666666666"
                || cpf == "77777777777"
                || cpf == "88888888888"
                || cpf == "99999999999"
            )
                return false;

                int[] multiplicador1 = new int[9] { 10, 9, 8, 7, 6, 5, 4, 3, 2 };
            int[] multiplicador2 = new int[10] { 11, 10, 9, 8, 7, 6, 5, 4, 3, 2 };
            string tempCpf;
            string digito;
            int soma;
            int resto;
            cpf = cpf.Trim();
            cpf = cpf.Replace(".", "").Replace("-", "");
            if (cpf.Length != 11)
                return false;
            tempCpf = cpf.Substring(0, 9);
            soma = 0;

            for (int i = 0; i < 9; i++)
                soma += int.Parse(tempCpf[i].ToString()) * multiplicador1[i];
            resto = soma % 11;
            if (resto < 2)
                resto = 0;
            else
                resto = 11 - resto;
            digito = resto.ToString();
            tempCpf += digito;
            soma = 0;
            for (int i = 0; i < 10; i++)
                soma += int.Parse(tempCpf[i].ToString()) * multiplicador2[i];
            resto = soma % 11;
            if (resto < 2)
                resto = 0;
            else
                resto = 11 - resto;
            digito += resto.ToString();
            return cpf.EndsWith(digito, StringComparison.OrdinalIgnoreCase);
        }
        public static string DatatimeToSQL(this DateTime texto)
            => (texto).ToString("yyyy-MM-dd HH:mm:ss.fff").Trim();
        public static string DecimalToSQL(this decimal? texto)
            => (texto ?? 0L).ToString(CultureInfo.GetCultureInfo("en-US").NumberFormat);
            //=> (texto ?? 0L).ToString().Replace(",", ".");
        public static string DecimalToSQL(this decimal texto)
            => texto.ToString(CultureInfo.GetCultureInfo("en-US").NumberFormat);
        //=> (texto).ToString().Replace(",", ".");
        public static string ToSchemaTable(this Type type)
        {
            if (type == null)
                return "";

            var _atributos = type?.GetCustomAttributes(typeof(TableAttribute), false)?.FirstOrDefault();
            if(_atributos == null)
                return "";

            TableAttribute propoerty = (TableAttribute)_atributos ?? new TableAttribute("");
            if (propoerty == null)
                return string.Empty;

            var _table = propoerty.Name ?? "";
            var _schema = propoerty.Schema ?? "dbo";
            return string.Format("[{0}].[{1}]", _schema, _table);
        }
        private static int Hora12to24(this int texto)
        {
            switch (texto)
            {
                case 1:  return 13;
                case 2:  return 14;
                case 3:  return 15;
                case 4:  return 16;
                case 5:  return 17;
                case 6:  return 18;
                case 7:  return 19;
                case 8:  return 20;
                case 9:  return 21;
                case 10: return 22;
                case 11: return 23;
                case 12: return 0;
                default: return 0;
            }
        }
        public static string Horario24hToSQL(this string texto)
        {
            if (string.IsNullOrEmpty(texto))
                return "Erro => função apenas para tratar horas: Formato HH:MM";

            if (!texto.Contains(':'))
                return "Erro => função apenas para tratar horas: Formato HH:MM";

            if (texto.Length >= 4 && texto.Length <= 9)
            {
                var _horaIn = texto.ToLower(culture: CultureInfo.CurrentCulture);
                string[] aux;
                string validate = "";

                if (_horaIn.Contains("am"))
                {
                    aux = _horaIn.Trim().Replace("am", "").Split(':');
                    if(aux.Length != 2)
                        return "Erro => função apenas para tratar horas: Formato HH:MM";

                    _ = int.TryParse(aux[0], out int _hora);
                    _ = int.TryParse(aux[1], out int _minuto);

                    validate = DateTime.Now.ToString("dd/MM/yyyy") + " " + _hora.ToString() + ":" + _minuto.ToString();
                    _ = DateTime.TryParse(validate, out DateTime _return);
                    return _return.ToString("yyyy-MM-dd HH:mm:ss.fff");

                }
                else if (_horaIn.Contains("pm"))
                {
                    aux = _horaIn.Trim().Replace("pm", "").Split(':');
                    if (aux.Length != 2)
                        return "Erro => função apenas para tratar horas: Formato HH:MM";

                    _ = int.TryParse(aux[0], out int _hora);
                    _ = int.TryParse(aux[1], out int _minuto);

                    validate = DateTime.Now.ToString("dd/MM/yyyy") + " " + _hora.Hora12to24().ToString() + ":" + _minuto.ToString();
                    _ = DateTime.TryParse(validate, out DateTime _return);
                    return _return.ToString("yyyy-MM-dd HH:mm:ss.fff");
                }
                else
                {
                    var _dia = DateTime.Now.ToString("yyyy-MM-dd") + " " + texto;
                    _ = DateTime.TryParse(_dia, out DateTime newHora);
                    return newHora.ToString("yyyy-MM-dd HH:mm:ss.fff");
                }
                
            }
            return "Erro => função apenas para tratar horas";
        }

        public static decimal ConvertToDecimal(this string texto)
        {
            texto ??= "";
            var _texto = texto.Trim();

            if (texto.Contains(','))
                _texto.Replace(".", "").Replace(",", ".");

            _texto = _texto.Replace(".", ",");

            _ = decimal.TryParse(_texto, out decimal _return);
            return _return;
        }

        public static string ReverseString(this string? texto)
        {
            char[] charArray = (texto ?? "").ToCharArray();
            Array.Reverse(charArray);
            return new string(charArray);
        }

        public static string SerializeObjectJson<T>(this T objeto) where T : class
        {
            if (objeto == null)
                return string.Empty;

            try
            {
                return JsonConvert.SerializeObject(objeto, Formatting.Indented, new JsonSerializerSettings
                {
                    NullValueHandling = NullValueHandling.Ignore
                });
            }
            catch { return string.Empty; }
        }

        public static string NormalizarTexto(this string texto) // add 06/12/2024
        {
            if (string.IsNullOrEmpty(texto)) return texto;

            texto = texto.Replace(",", "");
            if (double.TryParse(texto, NumberStyles.Float, CultureInfo.InvariantCulture, out var result))
                return result.ToString("F0", CultureInfo.InvariantCulture); 

            return new string(texto
                .Normalize(NormalizationForm.FormD)
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                .ToArray())
                .Trim();
        }

        private static List<string> GerarSlots()
        {
            var slots = new List<string>();
            var hora = new DateTime(2000, 1, 1, 8, 0, 0);
            var fim = new DateTime(2000, 1, 1, 18, 0, 0);
            while (hora < fim)
            {
                slots.Add(hora.ToString("HH:mm"));
                hora = hora.AddMinutes(30);
            }
            return slots;
        }

    }
}
