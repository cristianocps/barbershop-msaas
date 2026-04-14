using System.ComponentModel;
using System.Diagnostics;
using System.Reflection;

namespace BarberShop.Dominio.Entidade.Reflection
{
    [DebuggerStepThrough]
    public static class DefaultValuesReflection
    {
        public static void SetValuesDefault(this object o)
        {
            var propriedades = o.GetType()
                .GetProperties(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static);

            foreach (var propriedade in propriedades)
            {
                // pega o atributo DefaultValue
                var atributos = propriedade
                    .GetCustomAttributes(typeof(DefaultValueAttribute), true)
                    .OfType<DefaultValueAttribute>().ToArray();

                var valor = propriedade.GetValue(o);

                // se encontrou
                if (atributos != null && atributos.Length > 0 && valor == null)
                {
                    // pega o atributo
                    var atributoValorPadrao = atributos[0];

                    // seta o valor da propriedade do objeto o
                    // para o valor do atributo
                    try
                    {
                        propriedade.SetValue(o, atributoValorPadrao.Value, null);
                    }
                    catch { }
                }
            }
        }
    }
}
