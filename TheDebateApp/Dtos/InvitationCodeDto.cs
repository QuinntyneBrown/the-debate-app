namespace TheDebateApp.Dtos
{
    public class InvitationCodeDto
    {
        public InvitationCodeDto(TheDebateApp.Models.InvitationCode entity)
        {
            this.Id = entity.Id;
            this.Code = entity.Code;
        }

        public InvitationCodeDto()
        {
            
        }

        public int Id { get; set; }
        public string Code { get; set; }
    }
}
