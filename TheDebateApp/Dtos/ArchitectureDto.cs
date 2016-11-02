namespace TheDebateApp.Dtos
{
    public class ArchitectureDto
    {
        public ArchitectureDto(TheDebateApp.Models.Architecture entity)
        {
            this.Id = entity.Id;
            this.Name = entity.Name;
        }

        public ArchitectureDto()
        {
            
        }

        public int Id { get; set; }
        public string Name { get; set; }
    }
}
