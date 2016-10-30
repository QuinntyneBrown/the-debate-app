using TheDebateApp.Models;

namespace TheDebateApp.Data
{
    public interface IUow
    {
        IRepository<User> Users { get; }
        IRepository<Meeting> Meetings { get; }
        void SaveChanges();
    }
}
