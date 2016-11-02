using System;

namespace TheDebateApp.Models
{
    public class InvitationCode
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public DateTime? Expires { get; set; }
        public bool IsDeleted { get; set; }
    }
}
