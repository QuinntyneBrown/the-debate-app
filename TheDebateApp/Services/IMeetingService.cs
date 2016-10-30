using TheDebateApp.Dtos;
using System.Collections.Generic;

namespace TheDebateApp.Services
{
    public interface IMeetingService
    {
        MeetingAddOrUpdateResponseDto AddOrUpdate(MeetingAddOrUpdateRequestDto request);
        ICollection<MeetingDto> Get();
        MeetingDto GetById(int id);
        dynamic Remove(int id);
    }
}
