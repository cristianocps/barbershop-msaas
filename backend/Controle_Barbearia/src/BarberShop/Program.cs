using BarberShop.AbstractFactory;
using BarberShop.Configuracoes;
using BarberShop.Data;
using BarberShop.Data.Seed;
using BarberShop.Dominio.Interfaces.Base;
using Gestao_Winsiga.Apresentacao.AbstractFactory;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Principal;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

builder.Services.AddIdentity<IdentityUser, IdentityRole>(options => options.SignIn.RequireConfirmedAccount = true)
               .AddEntityFrameworkStores<ApplicationDbContext>()
               .AddRoles<IdentityRole>()
               .AddDefaultTokenProviders();

builder.Services.AddScoped<IDatabaseSeeder, DatabaseSeeder>();

// Aumenta o limite de body do Kestrel para aceitar imagens em Base64 (logo da empresa)
builder.WebHost.ConfigureKestrel(opts =>
{
    opts.Limits.MaxRequestBodySize = 20 * 1024 * 1024; // 20 MB
});

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Aumenta o buffer do System.Text.Json para aceitar JSON com Base64 grande
        opts.JsonSerializerOptions.MaxDepth = 64;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.Configure<IdentityOptions>(options =>
{
    // Password settings.
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequiredLength = 6;
    options.Password.RequiredUniqueChars = 1;

    // Lockout settings.
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromDays(60);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;

    // User settings.
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
    options.User.RequireUniqueEmail = true;
});

builder.Services.AddHsts(options =>
{
    options.Preload = true;
    options.IncludeSubDomains = true;
    options.MaxAge = TimeSpan.FromDays(60);
    options.ExcludedHosts.Add("example.com");
    options.ExcludedHosts.Add("www.example.com");
});

builder.Services.AddSwaggerGen(c =>
{
    // Adiciona a definição de segurança (O botão "Authorize")
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Insira o token JWT desta maneira: Bearer {seu_token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Diz ao Swagger para usar essa definição em todos os endpoints
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Secret"]!))
    };

    // ADICIONE ESTE BLOCO DE EVENTOS
    options.Events = new JwtBearerEvents
    {
        // Disparado quando o usuário NÃO está autenticado (Falta token ou token inválido - 401)
        OnChallenge = context =>
        {
            // Ignora o comportamento padrão do .NET de devolver corpo vazio
            context.HandleResponse();

            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";

            // Montamos o objeto igualzinho ao seu ResponseJson
            var result = System.Text.Json.JsonSerializer.Serialize(new
            {
                jsonTypes = "error",
                mensagem = "Acesso negado. Você precisa estar autenticado (Token ausente ou inválido).",
                data = (object?)null,
                recordsTotal = 0
            });

            return context.Response.WriteAsync(result);
        },

        // Disparado quando o usuário está autenticado, mas NÃO tem a role/política necessária (403)
        OnForbidden = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";

            var result = System.Text.Json.JsonSerializer.Serialize(new
            {
                jsonTypes = "error",
                mensagem = "Acesso bloqueado. Você não tem permissão para acessar este recurso.",
                data = (object?)null,
                recordsTotal = 0
            });

            return context.Response.WriteAsync(result);
        }
    };
});

builder.Services.AddAuthorization(options => { options.AddPolicy("Administrador", policy => policy.RequireRole("Admin")); });
builder.Services.AddAuthorization(options => { options.AddPolicy("Usuario", policy => policy.RequireRole("User")); });

builder.Services.AddHttpClient();
builder.Services.RegistrarServicosGestao();

builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
builder.Services.AddScoped<IUser, AspNetUser>();
builder.Services.AddScoped<IStoreRoles, StoreRoles>();

builder.Services.AddTransient<IPrincipal>(provider =>
    provider.GetService<IHttpContextAccessor>()?.HttpContext?.User ?? null!);


builder.Services.Configure<FormOptions>(x =>
{
    x.MultipartBodyLengthLimit = int.MaxValue;
    x.ValueLengthLimit = int.MaxValue;
});

builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromDays(60);
    options.Cookie.HttpOnly = false;
    options.Cookie.IsEssential = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        // Origens fixas + origens extras via variável de ambiente (para Portainer/Docker)
        var extraOrigins = builder.Configuration["CorsOrigins"]?.Split(',', StringSplitOptions.RemoveEmptyEntries) ?? [];

        var allOrigins = new[]
        {
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://app.barbershopp.com.br",
            "https://app.barbershopp.com.br"
        }.Concat(extraOrigins).Distinct().ToArray();

        policy.WithOrigins(allOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});





var app = builder.Build();

// ── Aplica migrations automaticamente no startup ──────────────
// Isso cria todas as tabelas no PostgreSQL na primeira vez que o container sobe.
// É idempotente: se as tabelas já existem, não faz nada.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();

    var seeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();
    await seeder.SeedAsync();
}

if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("PermitirFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
