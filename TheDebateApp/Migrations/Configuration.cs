namespace TheDebateApp.Migrations
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<TheDebateApp.Data.DataContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(TheDebateApp.Data.DataContext context)
        {
            UserConfiguration.Seed(context);
            MeetingConfiguration.Seed(context);
        }
    }
}
