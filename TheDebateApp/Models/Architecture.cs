using System.Collections.Generic;

namespace TheDebateApp.Models
{
    public class Architecture
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<ArchitectureItem> ArchitectureItems { get; set; } = new HashSet<ArchitectureItem>();
        public bool IsDeleted { get; set; }
    }
}
