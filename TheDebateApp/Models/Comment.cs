namespace TheDebateApp.Models
{
    public class Comment
    {
        public int Id { get; set; }
        public int? ArticleId { get; set; }
        public int? TechnologyId { get; set; }
        public int? UserId { get; set; }
        public User User { get; set; }
        public Article Article { get; set; }
        public Technology Technology { get; set; }
        public string Name { get; set; }
        public string Body { get; set; }
        public bool IsDeleted { get; set; }
    }
}
