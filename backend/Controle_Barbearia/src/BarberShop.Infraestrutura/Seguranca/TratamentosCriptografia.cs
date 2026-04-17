using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace BarberShop.Infraestrutura.Seguranca
{
    public static class TratamentosCriptografia
    {
        // Tamanho do salt (recomendado mínimo de 16 bytes)
        private const int SaltSize = 16;

        public static string Criptografar(string textoClaro, string senhaUsuario)
        {
            if (string.IsNullOrEmpty(textoClaro)) return textoClaro;
            if (string.IsNullOrEmpty(senhaUsuario)) throw new ArgumentException("A senha do usuário é obrigatória para criptografar.");

            byte[] salt = new byte[SaltSize];
            RandomNumberGenerator.Fill(salt);

            using (Aes aesAlg = Aes.Create())
            {
                // Deriva uma chave AES a partir da senha do usuário + salt
                using (var keyDerivation = new Rfc2898DeriveBytes(senhaUsuario, salt, 100000, HashAlgorithmName.SHA256))
                {
                    aesAlg.Key = keyDerivation.GetBytes(32); // AES-256 precisa de 32 bytes
                    aesAlg.IV = keyDerivation.GetBytes(16);  // Vetor de Inicialização precisa de 16 bytes
                }

                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    // Salvamos o salt no começo do stream para podermos descriptografar depois
                    msEncrypt.Write(salt, 0, salt.Length);

                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                    {
                        swEncrypt.Write(textoClaro);
                    }
                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }

        /// <summary>
        /// Descriptografa a Chave PIX. Só vai funcionar se a senha informada for a mesma usada na criptografia.
        /// </summary>
        public static string Descriptografar(string textoCriptografado, string senhaUsuario)
        {
            if (string.IsNullOrEmpty(textoCriptografado)) return textoCriptografado;
            if (string.IsNullOrEmpty(senhaUsuario)) throw new ArgumentException("A senha do usuário é obrigatória para continuar.");

            byte[] fullCipher = Convert.FromBase64String(textoCriptografado);

            // Extrai o salt do começo do texto criptografado
            byte[] salt = new byte[SaltSize];
            Array.Copy(fullCipher, 0, salt, 0, SaltSize);

            using (Aes aesAlg = Aes.Create())
            {
                // Recria a chave AES usando a senha do usuário + o salt que estava salvo
                using (var keyDerivation = new Rfc2898DeriveBytes(senhaUsuario, salt, 100000, HashAlgorithmName.SHA256))
                {
                    aesAlg.Key = keyDerivation.GetBytes(32);
                    aesAlg.IV = keyDerivation.GetBytes(16);
                }

                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                using (MemoryStream msDecrypt = new MemoryStream(fullCipher, SaltSize, fullCipher.Length - SaltSize))
                using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                {
                    return srDecrypt.ReadToEnd();
                }
            }
        }
    }
}