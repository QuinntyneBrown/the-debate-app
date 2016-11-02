namespace TheDebateApp.Models
{
    public class Technology
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public TechnologyType Type { get; set; }
        public string Description { get; set; }
        public bool IsDeleted { get; set; }
    }
}
