using System.Collections.Generic;

namespace TheDebateApp.Models
{
    public class ArchitectureItem
    {
        public int Id { get; set; }
        public int? ArchitectureId { get; set; }
        public string Name { get; set; }
        public Architecture Architecture { get; set; }
        public bool IsDeleted { get; set; }
    }
}
