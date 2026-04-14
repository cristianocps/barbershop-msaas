using Dapper;
using BarberShop.Dominio.Interfaces.Base;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System.Data;
using BarberShop.Dominio.Entidade.Reflection.Texto;

namespace BarberShop.Repositorio.Servicos
{
    public class PgSystemConnect : IDbConnectionFactory
    {
        private bool disposedValue;
        private NpgsqlConnection _connection = default!;
        private readonly string _connectionString;

        public PgSystemConnect(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentException("String de conexão não configurada.");
            _connection = new NpgsqlConnection(_connectionString);
        }

        public bool ExecuteCommandNonQuery(NpgsqlCommand command)
        {
            if (command == null)
                throw new ArgumentNullException(nameof(command));

            using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                command.Connection = connection;
                if (connection.State != ConnectionState.Open)
                    connection.Open();

                command.ExecuteNonQuery();
                return true;
            }
            catch (NpgsqlException ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
        }

        public async Task<int> ExecuteAsync(string queryCommand, int commandTimeout = 30)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                if (string.IsNullOrWhiteSpace(queryCommand))
                    throw new ArgumentException("Query não pode ser vazia", nameof(queryCommand));

                return await connection.ExecuteAsync(queryCommand, commandTimeout: commandTimeout).ConfigureAwait(false);
            }
            catch (NpgsqlException ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
        }

        public async Task<int> ExecuteAsync(string queryCommand, object? param = null, int commandTimeout = 30)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                if (string.IsNullOrWhiteSpace(queryCommand))
                    throw new ArgumentException("Query não pode ser vazia", nameof(queryCommand));

                return await connection.ExecuteAsync(queryCommand, param, commandTimeout: commandTimeout).ConfigureAwait(false);
            }
            catch (NpgsqlException ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
        }

        public async Task<IEnumerable<TEntity>> QueryAsync<TEntity>(string queryCommand, object? param = null, int commandTimeout = 30)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                if (string.IsNullOrWhiteSpace(queryCommand))
                    throw new ArgumentException("Query não pode ser vazia", nameof(queryCommand));

                // Esta é a linha que precisa ser corrigida
                // Você deve passar o parâmetro 'param' para o Dapper
                return await connection.QueryAsync<TEntity>(queryCommand, param: param, commandTimeout: commandTimeout).ConfigureAwait(false);
            }
            catch (NpgsqlException ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
        }
        public async Task<IEnumerable<TReturn>> QueryMultiAsync<TFirst, TSecond, TReturn>(string sql,Func<TFirst, TSecond, TReturn> map, object? param = null,string splitOn = "Id",int commandTimeout = 30)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                return await connection.QueryAsync(sql, map, param, splitOn: splitOn, commandTimeout: commandTimeout);
            }
            catch (NpgsqlException ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
        }



        public IEnumerable<TEntity> Query<TEntity>(string queryCommand, bool buffered = true, int commandTimeout = 30)
        {
            using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                if (string.IsNullOrWhiteSpace(queryCommand))
                    throw new ArgumentException("Query não pode ser vazia", nameof(queryCommand));

                if (connection.State != ConnectionState.Open)
                    connection.Open();

                return connection.Query<TEntity>(queryCommand, commandTimeout: commandTimeout, buffered: buffered);
            }
            catch (NpgsqlException ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao(ex.Message);
            }
        }

        public async Task<T?> QuerySingleOrDefaultAsync<T>(string? query, object? param = null, CommandType commandType = CommandType.Text, int commandTimeout = 30)
        {
            await using var connection = new NpgsqlConnection(_connectionString);
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                    throw new ArgumentException("O comando SQL não pode ser nulo ou vazio.", nameof(query));

                return await connection.QuerySingleOrDefaultAsync<T>(query, param, commandType: commandType, commandTimeout: commandTimeout).ConfigureAwait(false);
            }
            catch (NpgsqlException ex)
            {
                throw new TratamentoExcecao($"Erro ao executar a consulta: {ex.Message}");
            }
            catch (Exception ex)
            {
                throw new TratamentoExcecao($"Erro desconhecido: {ex.Message}");
            }
        }

        public async Task<T?> GetByIdAsync<T>(string tableName, string idColumn, object id)
        {
            var query = $@"SELECT * FROM public.""{tableName}"" WHERE {idColumn} = @Id LIMIT 1;";
            return await QuerySingleOrDefaultAsync<T>(query, new { Id = id });
        }



        public T RetornoOuVazio<T>(IEnumerable<T> source, Func<T> retornoVazioFactory)
        {
            if (source == null || !source.Any())
                return retornoVazioFactory();

            return source.First();
        }

        public T RetornoOuVazio<T>(T? source, Func<T> retornoVazioFactory) where T : class
        {
            return source ?? retornoVazioFactory();
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    if (_connection?.State == ConnectionState.Open)
                        _connection.Close();
                    _connection?.Dispose();
                }
                disposedValue = true;
            }
        }

      

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

    

    }
}