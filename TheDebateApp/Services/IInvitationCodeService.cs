using TheDebateApp.Dtos;
using System.Collections.Generic;

namespace TheDebateApp.Services
{
    public interface IInvitationCodeService
    {
        InvitationCodeAddOrUpdateResponseDto AddOrUpdate(InvitationCodeAddOrUpdateRequestDto request);
        ICollection<InvitationCodeDto> Get();
        InvitationCodeDto GetById(int id);
        dynamic Remove(int id);
    }
}
