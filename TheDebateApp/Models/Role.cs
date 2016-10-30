using System.Collections.Generic;

namespace TheDebateApp.Models
{
    public class Role
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
        public ICollection<User> Users { get; set; } = new HashSet<User>();
    }
}
