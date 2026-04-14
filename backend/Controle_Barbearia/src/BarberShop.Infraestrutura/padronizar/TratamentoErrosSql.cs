using System.Diagnostics;
using System.Globalization;

namespace BarberShop.Infraestrutura.padronizar
{
    [DebuggerStepThrough]
    public static class TradutorErrosSql
    {
        public static string Traduzir(this string erroMensagem, bool erroOut = true)
        {
            if (!erroOut)
                return erroMensagem;

            var _erroMensagem = erroMensagem
                ?.ToLower(culture: CultureInfo.CurrentCulture)
                .Replace('\r', ' ')
                .Replace('\n', ' ')
                .Replace('\t', ' ')
                .Replace("the statement has been terminated.", "");

            _erroMensagem ??= "";

            if (string.IsNullOrEmpty(_erroMensagem))
                return "";

            if (_erroMensagem.Contains("timeout waiting for response to originate"))
                return "Tempo limite para atender a chamada expirou";

            if (_erroMensagem.Contains("one or more errors occurred. (erro na quantidade de parametros passados para o procedimento)"))
                return "Um ou mais erros ocorreram. (erro na quantidade de parametros passados para o procedimento)";

            if (_erroMensagem.Contains("has too many arguments specified."))
                return "Erro na quantidade de parametros passados para o procedimento";

            if (_erroMensagem.Contains("originate failed"))
                return "Originação da chamada falhou";

            if (_erroMensagem.Contains("timeout waiting for protocol identifier"))
                return "Tempo limite de conexão com o discador";

            if (_erroMensagem.Contains("index (zero based) must be greater than or equal to zero and less than the size of the argument list."))
                return "Indice baseado em 0(Zero), precisa ser maior ou igual a zero e precisar o mesmo número de argumentos da lista";

            if (_erroMensagem.Contains("the insert statement conflicted with the check constraint"))
                return "Ocorreu um conflito no momento da inclusão/alteração de registro. conflito de identidade check";

            if (_erroMensagem.Contains("field is required."))
                return _erroMensagem.Replace("the ", "").Trim().Replace("field is required.", ": Este campo é obrigatório").Trim();


            if (_erroMensagem.Contains("procedure or function"))
                return "Erro de parametros no procedimento";


            if (_erroMensagem.Contains("the insert statement conflicted with the foreign key constraint"))
                return "Erro de chave estrangeira, não existe referência de código nas tabela para insert/update";


            if (_erroMensagem.Contains("the insert statement conflicted with the foreign key constraint"))
                return "Ocorreu erro de violação de chaves de inexistentes na tabela";


            if (_erroMensagem.Contains("could not find stored procedure"))
                return $@"Não foi possível localizar o procedimento: {_erroMensagem.Replace("could not find stored procedure", "").Trim()}";


            if (_erroMensagem.Contains("a transport-level error has occurred when receiving results from the server."))
                return "Erro de conexão, verifique se a Internet está conectada corretamente ou não foi possível estabelacer conexão com servidor de dados";


            if (_erroMensagem.Contains("invalid column name"))
                return "Erro versão DB => " + _erroMensagem.Replace("invalid column name", "Coluna: ");

            if (_erroMensagem.Contains("index and length must refer to a location within the string. (parameter 'length')"))
                return "Erro versão Layout => O tamanho ou indice precisa estar dentro do tamanho total do texto";


            if (_erroMensagem.Contains("the conversion of the varchar value"))
                return "Erro de conversão de dados Campo Texto para Numerico";


            if (_erroMensagem.Contains("passwords must be at least 6 characters"))
                return "Senha precisa ter no mínimo 6 caracteres";


            if (_erroMensagem.Contains("cannot insert duplicate key row in object"))
            {
                var _position = _erroMensagem.IndexOf("the duplicate key value is");
                return _erroMensagem.Substring(_position).Replace("the duplicate key value is", "Não é permitido inserir registro duplicado");
            }

            if (_erroMensagem.Contains("unexpected character encountered while parsing value:"))
                return "Erro na conversão dos dados. Layout alterado !!! Avise ao administrador";


            if (_erroMensagem.Contains("there are fewer columns in the insert statement than values specified in the values clause."))
                return "O Número de colunas para inclusão na tabela é diferente!!! Avise ao administrador";


            if (_erroMensagem.Contains("conflicted with the foreign key same table"))
                return "Existe um conflito de tabelas, não foi possível concluir a operação";


            if (_erroMensagem.Contains("the delete statement conflicted with the reference constraint") || _erroMensagem.Contains("the delete statement conflicted with the same table reference"))
                return "Não é possível excluir o registro, pois está sendo usado em outros cadastros.";


            if (_erroMensagem.Contains("invalid object name '"))
                return _erroMensagem.Replace("invalid object name", "Não é possível localizar: ");


            if (_erroMensagem.Contains("the duplicate key value is"))
            {
                var pos = _erroMensagem.ToLower(culture: CultureInfo.CurrentCulture).IndexOf("the duplicate key value is", System.StringComparison.CurrentCulture);
                var msg = _erroMensagem.ToLower(culture: CultureInfo.CurrentCulture);
                msg = msg.Substring(pos).Replace("the duplicate key value is", "");

                return string.Format("Não é permitido inserir valores duplicados na tabela: Valor Duplicado: {0}", msg);
            }

            if (_erroMensagem.Contains("cannot insert the value null into column "))
            {
                var pos = _erroMensagem.ToLower(culture: CultureInfo.CurrentCulture).IndexOf(", table", System.StringComparison.CurrentCulture);
                var msg = "Campo:  " + _erroMensagem.Substring(0, pos - 1).Replace("cannot insert the value null into column ", "");
                return string.Format("Não é permitido inserir valores vazios na tabela: {0}", msg);
            }

            if (_erroMensagem.Contains("não foi possível conectar ao discador para criação da campanha"))
                return "Não foi possível conectar ao discador para criação da campanha";

            if (_erroMensagem.Contains("make sure that the name is entered correctly."))
                return "Confira se o nome informado para o procedimento, base de dados or function está escrito de forma correta";


            return erroMensagem ?? "";// "Erro ao tentar completar a operação: Avise ao administrador do sistema";
        }
    }
}
