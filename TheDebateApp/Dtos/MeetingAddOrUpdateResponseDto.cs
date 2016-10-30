namespace TheDebateApp.Dtos
{
    public class MeetingAddOrUpdateResponseDto: MeetingDto
    {
        public MeetingAddOrUpdateResponseDto(TheDebateApp.Models.Meeting entity)
            :base(entity)
        {

        }
    }
}
