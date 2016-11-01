using System;

namespace TheDebateApp.Dtos
{
    public class MeetingDto
    {
        public MeetingDto(TheDebateApp.Models.Meeting entity)
        {
            this.Id = entity.Id;
            this.Date = string.Format("{0:yyyy-MM-dd}",entity.Date);
            this.Name = entity.Name;
            this.Start = entity.Start;
            this.End = entity.End;
            this.Abstract = entity.Abstract;
            this.Minutes = entity.Minutes;
        }

        public MeetingDto()
        {
            
        }

        public int Id { get; set; }
        public string Date { get; set; }
        public DateTime? Start { get; set; }
        public DateTime? End { get; set; }
        public string Abstract { get; set; }
        public string Agenda { get; set; }
        public string Minutes { get; set; }
        public string Name { get; set; }
    }
}
