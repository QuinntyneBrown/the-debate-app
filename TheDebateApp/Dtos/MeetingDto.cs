namespace TheDebateApp.Dtos
{
    public class MeetingDto
    {
        public MeetingDto(TheDebateApp.Models.Meeting entity)
        {
            this.Id = entity.Id;
            this.Name = entity.Name;
        }

        public MeetingDto()
        {
            
        }

        public int Id { get; set; }
        public string Name { get; set; }
    }
}
