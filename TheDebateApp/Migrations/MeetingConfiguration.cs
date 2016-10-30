using System.Data.Entity.Migrations;
using TheDebateApp.Data;
using TheDebateApp.Models;
using TheDebateApp.Services;

namespace TheDebateApp.Migrations
{
    public class MeetingConfiguration
    {
        public static void Seed(DataContext context) {

            context.Meetings.AddOrUpdate(x => x.Name, new Meeting()
            {
                Name = "Introduction",
                Agenda = "Introduction"
            });
            context.SaveChanges();
        }
    }
}
