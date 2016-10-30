namespace TheDebateApp.Data
{
    public interface IUow
    {
        IRepository<Models.User> Users { get; }
        void SaveChanges();
    }
}
