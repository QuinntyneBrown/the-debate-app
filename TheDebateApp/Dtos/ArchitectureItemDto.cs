namespace TheDebateApp.Dtos
{
    public class ArchitectureItemDto
    {
        public ArchitectureItemDto(TheDebateApp.Models.ArchitectureItem entity)
        {
            this.Id = entity.Id;
            this.Name = entity.Name;
        }

        public ArchitectureItemDto()
        {
            
        }

        public int Id { get; set; }
        public string Name { get; set; }
    }
}
