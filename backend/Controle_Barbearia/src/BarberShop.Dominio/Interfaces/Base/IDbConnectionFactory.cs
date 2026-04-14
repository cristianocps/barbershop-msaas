using System.Data;

namespace BarberShop.Dominio.Interfaces.Base
{
    public interface IDbConnectionFactory : IDisposable
    {
        Task<IEnumerable<TEntity>> QueryAsync<TEntity>(string queryCommand, object? param = null, int commandTimeout = 30);
        Task<T?> QuerySingleOrDefaultAsync<T>(string? query, object? param = null, CommandType commandType = CommandType.Text, int commandTimeout = 30);
        Task<int> ExecuteAsync(string queryCommand, int commandTimeout = 30);
        //bool ExecuteCommandNonQuery(NpgsqlCommand command);
        IEnumerable<TEntity> Query<TEntity>(string queryCommand, bool buffered = true, int commandTimeout = 30);
        Task<T?> GetByIdAsync<T>(string tableName, string idColumn, object id);
        Task<IEnumerable<TReturn>> QueryMultiAsync<TFirst, TSecond, TReturn>(string sql, Func<TFirst, TSecond, TReturn> map, object? param = null, string splitOn = "Id", int commandTimeout = 30);

        // ✅ ADICIONE ESTA LINHA
        Task<int> ExecuteAsync(string queryCommand, object? param = null, int commandTimeout = 30);

    }
}
