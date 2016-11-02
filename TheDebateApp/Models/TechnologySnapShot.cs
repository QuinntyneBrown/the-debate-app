using System;
using System.Collections.Generic;

namespace TheDebateApp.Models
{
    public class TechnologySnapShot
    {
        public int Id { get; set; }
        public int? TechnologyId { get; set; }
        public string Name { get; set; }
        public TechnologyType Type { get; set; }
        public TechnologyRadarCategory Category { get; set; }
        public string Description { get; set; }
        public DateTime? LastModified { get; set; }
        public DateTime? Published { get; set; }
        public DateTime? Created { get; set; }
        public Technology Technology { get; set; }
        public bool IsDeleted { get; set; }
    }
}
