using System;

namespace TheDebateApp.Models
{
    public class Technology
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public TechnologyType Type { get; set; }
        public TechnologyRadarCategory Category { get; set; }
        public string Description { get; set; }
        public DateTime? LastModified { get; set; }
        public DateTime? Published { get; set; }
        public DateTime? Created { get; set; }
        public bool IsDeleted { get; set; }
    }
}
