namespace TheDebateApp.Dtos
{
    public class InvitationCodeAddOrUpdateResponseDto: InvitationCodeDto
    {
        public InvitationCodeAddOrUpdateResponseDto(TheDebateApp.Models.InvitationCode entity)
            :base(entity)
        {

        }
    }
}
