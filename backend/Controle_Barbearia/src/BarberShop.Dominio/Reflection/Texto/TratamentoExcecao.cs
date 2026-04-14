using System.Data;
using System.Diagnostics;
using System.Globalization;

namespace BarberShop.Dominio.Entidade.Reflection.Texto
{
    [DebuggerStepThrough]
    public class TratamentoExcecao : Exception
    {
        public TratamentoExcecao(string message) : base(message) { Thread.CurrentThread.CurrentUICulture = CultureInfo.GetCultureInfo("pt-BR"); }
        public TratamentoExcecao(Exception innerException)
            : base(innerException.Message, innerException)
        {
            Thread.CurrentThread.CurrentUICulture = CultureInfo.GetCultureInfo("pt-BR");
            switch (innerException)
            {
                case PathTooLongException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um caminho ou nome de arquivo é maior que o comprimento máximo definido pelo sistema.", (PathTooLongException)innerException);
                //The exception that is thrown when a path or file name is longer than the system-defined maximum length.
                case DuplicateNameException:
                    throw new TratamentoExcecao("Representa a exceção lançada quando um nome de objeto de banco de dados duplicado é encontrado durante uma operação de adição em um objeto relacionado a DataSet.", (DuplicateNameException)innerException);
                //Represents the exception that is thrown when a duplicate database object name is encountered during an add operation in a DataSet -related object.
                case DllNotFoundException:
                    throw new TratamentoExcecao("A Exceção gerado quando uma DLL especificada em uma importação de DLL não pode ser encontrada.", (DllNotFoundException)innerException);
                //It is thrown when a DLL specified in a DLL import cannot be found.
                case EntryPointNotFoundException:
                    throw new TratamentoExcecao("A exceção que é lançada quando uma tentativa de carregar uma classe falha devido à ausência de um método de entrada.", (EntryPointNotFoundException)innerException);
                //The exception that is thrown when an attempt to load a class fails due to the absence of an entry method.
                case TypeAccessException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um método tenta usar um tipo ao qual ele não tem acesso.", (TypeAccessException)innerException);
                //The exception that is thrown when a method attempts to use a type that it does not have access to.
                case TypeInitializationException:
                    throw new TratamentoExcecao("A exceção que é lançada como um wrapper em torno da exceção lançada pelo inicializador de classe. Essa classe não pode ser herdada.", (TypeInitializationException)innerException);
                //The exception that is thrown as a wrapper around the exception thrown by the class initializer. This class cannot be inherited.
                case TypeLoadException:
                    throw new TratamentoExcecao("A exceção que é lançada quando ocorrem falhas de carregamento de tipo.", (TypeLoadException)innerException);
                //The exception that is thrown when type-loading failures occur.
                case TypeUnloadedException:
                    throw new TratamentoExcecao("A exceção que é lançada quando há uma tentativa de acessar uma classe descarregada.", (TypeUnloadedException)innerException);
                //The exception that is thrown when there is an attempt to access an unloaded class.
                case UnauthorizedAccessException:
                    throw new TratamentoExcecao("A exceção lançada quando o sistema operacional nega o acesso devido a um erro de E/S ou um tipo específico de erro de segurança.", (UnauthorizedAccessException)innerException);
                //The exception that is thrown when the operating system denies access because of an I/O error or a specific type of security error.
                case UriFormatException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um URI (Uniform Resource Identifier) ​​inválido é detectado.", (UriFormatException)innerException);
                //The exception that is thrown when an invalid Uniform Resource Identifier (URI) is detected.
                case ConstraintException:
                    throw new TratamentoExcecao("Representa a exceção lançada ao tentar uma ação que viola uma restrição.", (ConstraintException)innerException);
                //Represents the exception that is thrown when attempting an action that violates a constraint.
                case DBConcurrencyException:
                    throw new TratamentoExcecao("Obtém ou define o valor do DataRow que gerou o DBConcurrencyException.", (DBConcurrencyException)innerException);
                //Gets or sets the value of the DataRow that generated the DBConcurrencyException.
                case SyntaxErrorException:
                    throw new TratamentoExcecao("Representa a exceção lançada quando a propriedade Expression de um DataColumn contém um erro de sintaxe.", (SyntaxErrorException)innerException);
                //Represents the exception that is thrown when the Expression property of a DataColumn contains a syntax error.
                case EvaluateException:
                    throw new TratamentoExcecao("Representa a exceção que é lançada quando a propriedade Expression de um DataColumn não pode ser avaliada.", (EvaluateException)innerException);
                //Represents the exception that is thrown when the Expression property of a DataColumn cannot be evaluated.
                case InRowChangingEventException:
                    throw new TratamentoExcecao("Representa a exceção que é lançada quando você chama o método EndEdit dentro do evento RowChanging.", (InRowChangingEventException)innerException);
                //Represents the exception that is thrown when you call the EndEdit method within the RowChanging event.
                case InvalidConstraintException:
                    throw new TratamentoExcecao("Representa a exceção que é lançada ao tentar criar ou acessar incorretamente uma relação.", (InvalidConstraintException)innerException);
                //Represents the exception that is thrown when incorrectly trying to create or access a relation.
                case InvalidExpressionException:
                    throw new TratamentoExcecao("Representa a exceção que é lançada quando você tenta adicionar um DataColumn que contém uma expressão inválida a um DataColumnCollection.", (InvalidExpressionException)innerException);
                //Represents the exception that is thrown when you try to add a DataColumn that contains an invalid Expression to a DataColumnCollection.
                case MissingPrimaryKeyException:
                    throw new TratamentoExcecao("Representa a exceção lançada quando você tenta acessar uma linha em uma tabela que não possui chave primária.", (MissingPrimaryKeyException)innerException);
                //Represents the exception that is thrown when you try to access a row in a table that has no primary key.
                case NoNullAllowedException:
                    throw new TratamentoExcecao("Representa a exceção que é lançada quando você tenta inserir um valor nulo em uma coluna onde AllowDBNull está definido como false.", (NoNullAllowedException)innerException);
                //Represents the exception that is thrown when you try to insert a null value into a column where AllowDBNull is set tofalse.
                case ReadOnlyException:
                    throw new TratamentoExcecao("Representa a exceção lançada quando você tenta alterar o valor de uma coluna somente leitura.", (ReadOnlyException)innerException);
                //Represents the exception that is thrown when you try to change the value of a read-only column.
                case RowNotInTableException:
                    throw new TratamentoExcecao("Representa a exceção que é lançada quando você tenta realizar uma operação em um DataRow que não está em um DataTable.", (RowNotInTableException)innerException);
                //Represents the exception that is thrown when you try to perform an operation on a DataRow that is not in a DataTable.
                case StrongTypingException:
                    throw new TratamentoExcecao("A exceção que é lançada por um DataSet fortemente tipado quando o usuário acessa um valor DBNull.", (StrongTypingException)innerException);
                //The exception that is thrown by a strongly typed DataSet when the user accesses a DBNull value.
                case VersionNotFoundException:
                    throw new TratamentoExcecao("Representa a exceção lançada quando você tenta retornar uma versão de um DataRow que foi excluído.", (VersionNotFoundException)innerException);
                //Represents the exception that is thrown when you try to return a version of a DataRow that has been deleted. 
                case DataException:
                    throw new TratamentoExcecao("Representa a exceção lançada ao tentar uma ação que viola uma restrição.", (DataException)innerException);
                //Represents the exception that is thrown when attempting an action that violates a constraint.
                case DirectoryNotFoundException:
                    throw new TratamentoExcecao("A exceção que é lançada quando parte de um arquivo ou diretório não pode ser encontrada.", (DirectoryNotFoundException)innerException);
                //The exception that is thrown when part of a file or directory cannot be found.
                case DriveNotFoundException:
                    throw new TratamentoExcecao("A exceção lançada quando uma unidade referenciada por uma operação não pôde ser encontrada.", (DriveNotFoundException)innerException);
                //The exception that is thrown when a drive that is referenced by an operation could not be found.
                case EndOfStreamException:
                    throw new TratamentoExcecao("Uma exceção EndOfStreamException é lançada quando há uma tentativa de ler além do final de um fluxo.", (EndOfStreamException)innerException);
                //An EndOfStreamException exception is thrown when there is an attempt to read past the end of a stream.
                case FileLoadException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um assembly gerenciado é encontrado, mas não pode ser carregado.", (FileLoadException)innerException);
                //The exception that is thrown when a managed assembly is found but cannot be loaded.
                case FileNotFoundException:
                    throw new TratamentoExcecao("A exceção que é lançada quando uma tentativa de acessar um arquivo que não existe no disco falha.", (FileNotFoundException)innerException);
                //The exception that is thrown when an attempt to access a file that does not exist on disk fails.
                case InternalBufferOverflowException:
                    throw new TratamentoExcecao("A exceção lançada quando o buffer interno estoura.", (InternalBufferOverflowException)innerException);
                //The exception thrown when the internal buffer overflows.
                case InvalidDataException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um fluxo de dados está em um formato inválido.", (InvalidDataException)innerException);
                //The exception that is thrown when a data stream is in an invalid format.
                case IOException:
                    throw new TratamentoExcecao("A exceção que é lançada quando ocorre um erro de E/S.", (IOException)innerException);
                //The exception that is thrown when an I/O error occurs.
                case TimeoutException:
                    throw new TratamentoExcecao("A exceção que é lançada quando o tempo alocado para um processo ou operação expirou.", (TimeoutException)innerException);
                //The exception that is thrown when the time allotted for a process or operation has expired.
                case PlatformNotSupportedException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um recurso não é executado em uma plataforma específica.", (PlatformNotSupportedException)innerException);
                //The exception that is thrown when a feature does not run on a particular platform.
                case ObjectDisposedException:
                    throw new TratamentoExcecao("A exceção que é lançada quando uma operação é executada em um objeto descartado.", (ObjectDisposedException)innerException);
                //The exception that is thrown when an operation is performed on a disposed object.
                case AccessViolationException:
                    throw new TratamentoExcecao("A exceção é lançado ao tentar ler ou escrever na memória protegida.", (AccessViolationException)innerException);
                //It is thrown when try to read or write protected memory.
                case AggregateException:
                    throw new TratamentoExcecao("Representa um ou mais erros que ocorrem durante a execução do aplicativo.", (AggregateException)innerException);
                //Represents one or more errors that occur during application execution.
                case AppDomainUnloadedException:
                    throw new TratamentoExcecao("A exceção é lançado ao tentar acessar um domínio de aplicativo descarregado.", (AppDomainUnloadedException)innerException);
                //It is thrown when try to access an unloaded application domain.
                case ApplicationException:
                    throw new TratamentoExcecao(base.Message + "\n\nA exceção foi lançada na classe base para exceções definidas pelo aplicativo.", (ApplicationException)innerException);
                //It is base class for application-defined exceptions.
                case ArgumentNullException:
                    throw new TratamentoExcecao("A exceção é lançada quando um método requer argumento, mas nenhum argumento é fornecido.", (ArgumentNullException)innerException);
                //It is thrown when a method requires argument but no argument is provided.
                case ArgumentOutOfRangeException:
                    throw new TratamentoExcecao("A exceção é lançado quando o valor de um argumento está fora do intervalo permitido.", (ArgumentOutOfRangeException)innerException);
                //It is thrown when value of an argument is outside the allowable range.
                case DuplicateWaitObjectException:
                    throw new TratamentoExcecao("A exceção é lançada quando um objeto aparece mais de uma vez em uma matriz de objetos de sincronização.", (DuplicateWaitObjectException)innerException);
                //The exception that is thrown when an object appears more than once in an array of synchronization objects.
                case ArgumentException:
                    throw new TratamentoExcecao("A exceção é lançado quando um argumento inválido é fornecido a um método.", (ArgumentException)innerException);
                //It is thrown when invalid argument provided to a method.
                case OverflowException:
                    throw new TratamentoExcecao("A exceção que é lançada quando uma operação aritmética, conversão ou conversão em um contexto verificado resulta em um estouro.", (OverflowException)innerException);
                //The exception that is thrown when an arithmetic, casting, or conversion operation in a checked context results in an overflow.
                case NotFiniteNumberException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um valor de ponto flutuante é infinito positivo, infinito negativo ou Not-a-Number (NaN).", (NotFiniteNumberException)innerException);
                //The exception that is thrown when a floating-point value is positive infinity, negative infinity, or Not-a-Number (NaN).
                case DivideByZeroException:
                    throw new TratamentoExcecao("A exceção é lançado quando há uma tentativa de dividir um valor integral ou decimal por zero.", (DivideByZeroException)innerException);
                //It is thrown when there is an attempt to divide an integral or decimal value by zero.
                case ArithmeticException:
                    throw new TratamentoExcecao("A exceção é lançado ao fazer operações aritméticas, de casting ou de conversão.", (ArithmeticException)innerException);
                //It is thrown when doing arithmetic, casting, or conversion operation.
                case ArrayTypeMismatchException:
                    throw new TratamentoExcecao("A exceção é lançado ao tentar armazenar um elemento do tipo errado em uma matriz.", (ArrayTypeMismatchException)innerException);
                //It is thrown when try to store an element of the wrong type within an array.
                case BadImageFormatException:
                    throw new TratamentoExcecao("A exceção é lançado quando a imagem do arquivo, dll ou programa exe é inválido.", (BadImageFormatException)innerException);
                //It is thrown when file image, dll or exe program is invalid.
                case CannotUnloadAppDomainException:
                    throw new TratamentoExcecao("A exceção é acionado quando a tentativa de descarregar um domínio de aplicativo falha.", (CannotUnloadAppDomainException)innerException);
                //It is thrown when try to unload an application domain fails.
                case ContextMarshalException:
                    throw new TratamentoExcecao("A exceção que é lançada quando uma tentativa de empacotar um objeto em um limite de contexto falha.", (ContextMarshalException)innerException);
                //The exception that is thrown when an attempt to marshal an object across a context boundary fails.
                case DataMisalignedException:
                    throw new TratamentoExcecao("A exceção é lançado quando uma unidade de dados é lida ou gravada em um endereço que não é um múltiplo do tamanho dos dados.", (DataMisalignedException)innerException);
                //It is thrown thrown when a unit of data is read from or written to an address that is not a multiple of the data size.
                case FieldAccessException:
                    throw new TratamentoExcecao("A exceção é lançado quando há uma tentativa inválida de acessar um campo privado ou protegido dentro de uma classe.", (FieldAccessException)innerException);
                //It is thrown when there is an invalid attempt to access a private or protected field inside a class.
                case FormatException:
                    throw new TratamentoExcecao("A exceção que é lançada quando o formato de um argumento é inválido ou quando uma string de formato composto não está bem formada.", (FormatException)innerException);
                //The exception that is thrown when the format of an argument is invalid, or when a composite format string is not well formed.
                case IndexOutOfRangeException:
                    throw new TratamentoExcecao("A exceção que é lançada quando é feita uma tentativa de acessar um elemento de uma matriz ou coleção com um índice que está fora de seus limites.", (IndexOutOfRangeException)innerException);
                //The exception that is thrown when an attempt is made to access an element of an array or collection with an index that is outside its bounds.
                case InsufficientMemoryException:
                    throw new TratamentoExcecao("A exceção que é lançada quando uma verificação de memória disponível suficiente falha. Essa classe não pode ser herdada.", (InsufficientMemoryException)innerException);
                //The exception that is thrown when a check for sufficient available memory fails. This class cannot be inherited.
                case InvalidCastException:
                    throw new TratamentoExcecao("A exceção lançada para conversão inválida ou conversão explícita.", (InvalidCastException)innerException);
                //The exception that is thrown for invalid casting or explicit conversion.
                case InvalidOperationException:
                    throw new TratamentoExcecao("A exceção que é lançada quando uma chamada de método é inválida para o estado atual dos objetos.", (InvalidOperationException)innerException);
                //The exception that is thrown when a method call is invalid for the objects current state.
                case InvalidProgramException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um programa contém linguagem intermediária da Microsoft (MSIL) inválida ou metadados.", (InvalidProgramException)innerException);
                //The exception that is thrown when a program contains invalid Microsoft intermediate language (MSIL) or metadata.
                case InvalidTimeZoneException:
                    throw new TratamentoExcecao("A exceção que é lançada quando as informações de fuso horário são inválidas.", (InvalidTimeZoneException)innerException);
                //The exception that is thrown when time zone information is invalid.
                case MethodAccessException:
                    throw new TratamentoExcecao("A exceção que é lançada quando há uma tentativa inválida de acessar um método, como acessar um método privado de um código parcialmente confiável.", (MethodAccessException)innerException);
                //The exception that is thrown when there is an invalid attempt to access a method, such as accessing a private method from partially trusted code.
                case MissingFieldException:
                    throw new TratamentoExcecao("A exceção que é lançada quando há uma tentativa de acessar dinamicamente um campo que não existe.", (MissingFieldException)innerException);
                //The exception that is thrown when there is an attempt to dynamically access a field that does not exist.
                case MissingMethodException:
                    throw new TratamentoExcecao("A exceção que é lançada quando há uma tentativa de acessar dinamicamente um método que não existe.", (MissingMethodException)innerException);
                //The exception that is thrown when there is an attempt to dynamically access a method that does not exist.
                case MissingMemberException:
                    throw new TratamentoExcecao("A exceção que é lançada quando há uma tentativa de acessar dinamicamente um membro de classe que não existe.", (MissingMemberException)innerException);
                //The exception that is thrown when there is an attempt to dynamically access a class member that does not exist.
                case MemberAccessException:
                    throw new TratamentoExcecao("A exceção que é lançada quando uma tentativa de acessar um membro de classe falha.", (MemberAccessException)innerException);
                //The exception that is thrown when an attempt to access a class member fails.
                case MulticastNotSupportedException:
                    throw new TratamentoExcecao("A exceção que é lançada quando há uma tentativa de combinar dois delegados com base no tipo Delegate em vez do tipo MulticastDelegate.", (MulticastNotSupportedException)innerException);
                //The exception that is thrown when there is an attempt to combine two delegates based on the Delegate type instead of the MulticastDelegate type.
                case NotImplementedException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um método ou operação solicitada não é implementado.", (NotImplementedException)innerException);
                //The exception that is thrown when a requested method or operation is not implemented.
                case NotSupportedException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um método invocado não é suportado ou quando há uma tentativa de ler, buscar ou gravar em um fluxo que não suporta a funcionalidade invocada.", (NotSupportedException)innerException);
                //The exception that is thrown when an invoked method is not supported, or when there is an attempt to read, seek, or write to a stream that does not support the invoked functionality.
                case NullReferenceException:
                    throw new TratamentoExcecao("A exceção que é lançada quando há uma tentativa de desreferenciar uma referência de objeto nulo.", (NullReferenceException)innerException);
                //The exception that is thrown when there is an attempt to dereference a null object reference.
                case OperationCanceledException:
                    throw new TratamentoExcecao("A exceção que é lançada em um encadeamento após o cancelamento de uma operação que o encadeamento estava executando.", (OperationCanceledException)innerException);
                //The exception that is thrown in a thread upon cancellation of an operation that the thread was executing.
                case OutOfMemoryException:
                    throw new TratamentoExcecao("A exceção que é lançada quando não há memória suficiente para continuar a execução de um programa.", (OutOfMemoryException)innerException);
                //The exception that is thrown when there is not enough memory to continue the execution of a program.
                case RankException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um array com o número errado de dimensões é passado para um método.", (RankException)innerException);
                //The exception that is thrown when an array with the wrong number of dimensions is passed to a method.
                case StackOverflowException:
                    throw new TratamentoExcecao("A exceção que é lançada quando a pilha de execução estoura porque contém muitas chamadas de método aninhadas.", (StackOverflowException)innerException);
                //The exception that is thrown when the execution stack overflows because it contains too many nested method calls.
                case SystemException:
                    throw new TratamentoExcecao(base.Message + "\n\nA exceção foi lançada na classe base para o namespace de exceções do sistema.", (SystemException)innerException);
                //Serves as the base class for system exceptions namespace.
                case TimeZoneNotFoundException:
                    throw new TratamentoExcecao("A exceção que é lançada quando um fuso horário não pode ser encontrado.", (TimeZoneNotFoundException)innerException);
                    //The exception that is thrown when a time zone cannot be found.
            }
        }

        #region private metodes
        private TratamentoExcecao(string message, AccessViolationException innerException) : base(message, innerException) { }//It is thrown when try to read or write protected memory.
        private TratamentoExcecao(string message, AggregateException innerException) : base(message, innerException) { }//Represents one or more errors that occur during application execution.
        private TratamentoExcecao(string message, AppDomainUnloadedException innerException) : base(message, innerException) { }//It is thrown when try to access an unloaded application domain.
        private TratamentoExcecao(string message, ApplicationException innerException) : base(message, innerException) { }//It is base class for application-defined exceptions.
        private TratamentoExcecao(string message, ArgumentException innerException) : base(message, innerException) { }//It is thrown when invalid argument provided to a method.
        private TratamentoExcecao(string message, ArgumentNullException innerException) : base(message, innerException) { }//It is thrown when a method requires argument but no argument is provided.
        private TratamentoExcecao(string message, ArgumentOutOfRangeException innerException) : base(message, innerException) { }//It is thrown when value of an argument is outside the allowable range.
        private TratamentoExcecao(string message, ArithmeticException innerException) : base(message, innerException) { }//It is thrown when doing arithmetic, casting, or conversion operation.
        private TratamentoExcecao(string message, ArrayTypeMismatchException innerException) : base(message, innerException) { }//It is thrown when try to store an element of the wrong type within an array.
        private TratamentoExcecao(string message, BadImageFormatException innerException) : base(message, innerException) { }//It is thrown when file image, dll or exe program is invalid.
        private TratamentoExcecao(string message, CannotUnloadAppDomainException innerException) : base(message, innerException) { }//It is thrown when try to unload an application domain fails.
        private TratamentoExcecao(string message, ContextMarshalException innerException) : base(message, innerException) { }//The exception that is thrown when an attempt to marshal an object across a context boundary fails.
        private TratamentoExcecao(string message, DataMisalignedException innerException) : base(message, innerException) { }//It is thrown thrown when a unit of data is read from or written to an address that is not a multiple of the data size.
        private TratamentoExcecao(string message, DivideByZeroException innerException) : base(message, innerException) { return; }//It is thrown when there is an attempt to divide an integral or decimal value by zero.
        private TratamentoExcecao(string message, DllNotFoundException innerException) : base(message, innerException) { }//It is thrown when a DLL specified in a DLL import cannot be found.
        private TratamentoExcecao(string message, DuplicateWaitObjectException innerException) : base(message, innerException) { }//The exception that is thrown when an object appears more than once in an array of synchronization objects.
        private TratamentoExcecao(string message, EntryPointNotFoundException innerException) : base(message, innerException) { }//The exception that is thrown when an attempt to load a class fails due to the absence of an entry method.
        private TratamentoExcecao(string message, FieldAccessException innerException) : base(message, innerException) { }//It is thrown when there is an invalid attempt to access a private or protected field inside a class.
        private TratamentoExcecao(string message, FormatException innerException) : base(message, innerException) { }//The exception that is thrown when the format of an argument is invalid, or when a composite format string is not well formed.
        private TratamentoExcecao(string message, IndexOutOfRangeException innerException) : base(message, innerException) { }//The exception that is thrown when an attempt is made to access an element of an array or collection with an index that is outside its bounds.
        private TratamentoExcecao(string message, InsufficientMemoryException innerException) : base(message, innerException) { }//The exception that is thrown when a check for sufficient available memory fails. This class cannot be inherited.
        private TratamentoExcecao(string message, InvalidCastException innerException) : base(message, innerException) { }//The exception that is thrown for invalid casting or explicit conversion.
        private TratamentoExcecao(string message, InvalidOperationException innerException) : base(message, innerException) { }//The exception that is thrown when a method call is invalid for the objects current state.
        private TratamentoExcecao(string message, InvalidProgramException innerException) : base(message, innerException) { }//The exception that is thrown when a program contains invalid Microsoft intermediate language (MSIL) or metadata.
        private TratamentoExcecao(string message, InvalidTimeZoneException innerException) : base(message, innerException) { }//The exception that is thrown when time zone information is invalid.
        private TratamentoExcecao(string message, MemberAccessException innerException) : base(message, innerException) { }//The exception that is thrown when an attempt to access a class member fails.
        private TratamentoExcecao(string message, MethodAccessException innerException) : base(message, innerException) { }//The exception that is thrown when there is an invalid attempt to access a method, such as accessing a private method from partially trusted code.
        private TratamentoExcecao(string message, MissingFieldException innerException) : base(message, innerException) { }//The exception that is thrown when there is an attempt to dynamically access a field that does not exist.
        private TratamentoExcecao(string message, MissingMemberException innerException) : base(message, innerException) { }//The exception that is thrown when there is an attempt to dynamically access a class member that does not exist.
        private TratamentoExcecao(string message, MissingMethodException innerException) : base(message, innerException) { }//The exception that is thrown when there is an attempt to dynamically access a method that does not exist.
        private TratamentoExcecao(string message, MulticastNotSupportedException innerException) : base(message, innerException) { }//The exception that is thrown when there is an attempt to combine two delegates based on the Delegate type instead of the MulticastDelegate type.
        private TratamentoExcecao(string message, NotFiniteNumberException innerException) : base(message, innerException) { }//The exception that is thrown when a floating-point value is positive infinity, negative infinity, or Not-a-Number (NaN).
        private TratamentoExcecao(string message, NotImplementedException innerException) : base(message, innerException) { }//The exception that is thrown when a requested method or operation is not implemented.
        private TratamentoExcecao(string message, NotSupportedException innerException) : base(message, innerException) { }//The exception that is thrown when an invoked method is not supported, or when there is an attempt to read, seek, or write to a stream that does not support the invoked functionality.
        private TratamentoExcecao(string message, NullReferenceException innerException) : base(message, innerException) { }//The exception that is thrown when there is an attempt to dereference a null object reference.
        private TratamentoExcecao(string message, ObjectDisposedException innerException) : base(message, innerException) { }//The exception that is thrown when an operation is performed on a disposed object.
        private TratamentoExcecao(string message, OperationCanceledException innerException) : base(message, innerException) { }//The exception that is thrown in a thread upon cancellation of an operation that the thread was executing.
        private TratamentoExcecao(string message, OutOfMemoryException innerException) : base(message, innerException) { }//The exception that is thrown when there is not enough memory to continue the execution of a program.
        private TratamentoExcecao(string message, OverflowException innerException) : base(message, innerException) { }//The exception that is thrown when an arithmetic, casting, or conversion operation in a checked context results in an overflow.
        private TratamentoExcecao(string message, PlatformNotSupportedException innerException) : base(message, innerException) { }//The exception that is thrown when a feature does not run on a particular platform.
        private TratamentoExcecao(string message, RankException innerException) : base(message, innerException) { }//The exception that is thrown when an array with the wrong number of dimensions is passed to a method.
        private TratamentoExcecao(string message, StackOverflowException innerException) : base(message, innerException) { }//The exception that is thrown when the execution stack overflows because it contains too many nested method calls.
        private TratamentoExcecao(string message, SystemException innerException) : base(message, innerException) { }//Serves as the base class for system exceptions namespace.
        private TratamentoExcecao(string message, TimeoutException innerException) : base(message, innerException) { }//The exception that is thrown when the time allotted for a process or operation has expired.
        private TratamentoExcecao(string message, TimeZoneNotFoundException innerException) : base(message, innerException) { }//The exception that is thrown when a time zone cannot be found.
        private TratamentoExcecao(string message, TypeAccessException innerException) : base(message, innerException) { }//The exception that is thrown when a method attempts to use a type that it does not have access to.
        private TratamentoExcecao(string message, TypeInitializationException innerException) : base(message, innerException) { }//The exception that is thrown as a wrapper around the exception thrown by the class initializer. This class cannot be inherited.
        private TratamentoExcecao(string message, TypeLoadException innerException) : base(message, innerException) { }//The exception that is thrown when type-loading failures occur.
        private TratamentoExcecao(string message, TypeUnloadedException innerException) : base(message, innerException) { }//The exception that is thrown when there is an attempt to access an unloaded class.
        private TratamentoExcecao(string message, UnauthorizedAccessException innerException) : base(message, innerException) { }//The exception that is thrown when the operating system denies access because of an I/O error or a specific type of security error.
        private TratamentoExcecao(string message, UriFormatException innerException) : base(message, innerException) { }//The exception that is thrown when an invalid Uniform Resource Identifier (URI) is detected.
        private TratamentoExcecao(string message, ConstraintException innerException) : base(message, innerException) { }//Represents the exception that is thrown when attempting an action that violates a constraint.
        private TratamentoExcecao(string message, DataException innerException) : base(message, innerException) { }//Represents the exception that is thrown when attempting an action that violates a constraint.
        private TratamentoExcecao(string message, DBConcurrencyException innerException) : base(message, innerException) { }//Gets or sets the value of the DataRow that generated the DBConcurrencyException.
        private TratamentoExcecao(string message, DuplicateNameException innerException) : base(message, innerException) { }//Represents the exception that is thrown when a duplicate database object name is encountered during an add operation in a DataSet -related object.
        private TratamentoExcecao(string message, EvaluateException innerException) : base(message, innerException) { }//Represents the exception that is thrown when the Expression property of a DataColumn cannot be evaluated.
        private TratamentoExcecao(string message, InRowChangingEventException innerException) : base(message, innerException) { }//Represents the exception that is thrown when you call the EndEdit method within the RowChanging event.
        private TratamentoExcecao(string message, InvalidConstraintException innerException) : base(message, innerException) { }//Represents the exception that is thrown when incorrectly trying to create or access a relation.
        private TratamentoExcecao(string message, InvalidExpressionException innerException) : base(message, innerException) { }//Represents the exception that is thrown when you try to add a DataColumn that contains an invalid Expression to a DataColumnCollection.
        private TratamentoExcecao(string message, MissingPrimaryKeyException innerException) : base(message, innerException) { }//Represents the exception that is thrown when you try to access a row in a table that has no primary key.
        private TratamentoExcecao(string message, NoNullAllowedException innerException) : base(message, innerException) { }//Represents the exception that is thrown when you try to insert a null value into a column where AllowDBNull is set tofalse.
        private TratamentoExcecao(string message, ReadOnlyException innerException) : base(message, innerException) { }//Represents the exception that is thrown when you try to change the value of a read-only column.
        private TratamentoExcecao(string message, RowNotInTableException innerException) : base(message, innerException) { }//Represents the exception that is thrown when you try to perform an operation on a DataRow that is not in a DataTable.
        private TratamentoExcecao(string message, StrongTypingException innerException) : base(message, innerException) { }//The exception that is thrown by a strongly typed DataSet when the user accesses a DBNull value.
        private TratamentoExcecao(string message, SyntaxErrorException innerException) : base(message, innerException) { }//Represents the exception that is thrown when the Expression property of a DataColumn contains a syntax error.
        private TratamentoExcecao(string message, VersionNotFoundException innerException) : base(message, innerException) { }//Represents the exception that is thrown when you try to return a version of a DataRow that has been deleted. 
        private TratamentoExcecao(string message, DirectoryNotFoundException innerException) : base(message, innerException) { }//The exception that is thrown when part of a file or directory cannot be found.
        private TratamentoExcecao(string message, DriveNotFoundException innerException) : base(message, innerException) { }//The exception that is thrown when a drive that is referenced by an operation could not be found.
        private TratamentoExcecao(string message, EndOfStreamException innerException) : base(message, innerException) { }//An EndOfStreamException exception is thrown when there is an attempt to read past the end of a stream.
        private TratamentoExcecao(string message, FileLoadException innerException) : base(message, innerException) { }//The exception that is thrown when a managed assembly is found but cannot be loaded.
        private TratamentoExcecao(string message, FileNotFoundException innerException) : base(message, innerException) { }//The exception that is thrown when an attempt to access a file that does not exist on disk fails.
        private TratamentoExcecao(string message, InternalBufferOverflowException innerException) : base(message, innerException) { }//The exception thrown when the internal buffer overflows.
        private TratamentoExcecao(string message, InvalidDataException innerException) : base(message, innerException) { }//The exception that is thrown when a data stream is in an invalid format.
        private TratamentoExcecao(string message, IOException innerException) : base(message, innerException) { }//The exception that is thrown when an I/O error occurs.
        private TratamentoExcecao(string message, PathTooLongException innerException) : base(message, innerException) { }//The exception that is thrown when a path or file name is longer than the system-defined maximum length.


        //public TratamentoCustonException(string message, PipeException innerException) : base(message, innerException) { }//Thrown when an error occurs within a named pipe.
        //public TratamentoCustonException(string message, FileFormatException innerException) : base(message, innerException) { }//The exception that is thrown when an input file or a data stream that is supposed to conform to a certain file format specification is malformed.
        //public TratamentoCustonException(string message, TypedDataSetGeneratorException innerException) : base(message, innerException) { }//The exception that is thrown when a name conflict occurs while generating a strongly typed DataSet.
        //public TratamentoCustonException(string message, OperationAbortedException innerException) : base(message, innerException) { }//This exception is thrown when an ongoing operation is aborted by the user.
        //public TratamentoCustonException(string message, DeleteRowInaccessibleException innerException) : base(message, innerException) { }//Represents the exception that is thrown when an action is tried on a DataRow that has been deleted.
        #endregion
        public override Exception GetBaseException()
        {
            return base.GetBaseException();
        }
    }
}
