using System;

namespace TheDebateApp.Models
{
    public class Meeting
    {
        public int Id { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Agenda { get; set; }
        public string Minutes { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
    }
}
