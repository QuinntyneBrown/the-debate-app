using System.Collections.Generic;

namespace TheDebateApp.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
    }
}