using System.Data.Entity.Migrations;
using TheDebateApp.Data;
using TheDebateApp.Models;
using TheDebateApp.Services;

namespace TheDebateApp.Migrations
{
    public class UserConfiguration
    {
        public static void Seed(DataContext context) {

            context.Users.AddOrUpdate(x => x.Username, new User()
            {
                Username = "admin",
                Password = new EncryptionService().TransformPassword("thegreatwpdebate")
            });
            context.SaveChanges();
        }
    }
}
