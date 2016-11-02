using TheDebateApp.Models;

namespace TheDebateApp.Data
{
    public interface IUow
    {
        IRepository<Article> Articles { get; }
        IRepository<Architecture> Architectures { get; }
        IRepository<ArchitectureItem> ArchitectureItems { get; }
        IRepository<User> Users { get; }
        IRepository<Meeting> Meetings { get; }
        IRepository<Role> Roles { get; }
        IRepository<InvitationCode> InvitationCodes { get; }
        IRepository<DigitalAsset> DigitalAssets { get; }

        void SaveChanges();
    }
}
