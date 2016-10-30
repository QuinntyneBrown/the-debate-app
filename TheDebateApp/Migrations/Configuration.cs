namespace TheDebateApp.Migrations
{
    using Data;
    using System.Data.Entity.Migrations;
    
    internal sealed class Configuration : DbMigrationsConfiguration<TheDebateApp.Data.DataContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
        }

        protected override void Seed(DataContext context)
        {
            UserConfiguration.Seed(context);
            MeetingConfiguration.Seed(context);
        }
    }
}
