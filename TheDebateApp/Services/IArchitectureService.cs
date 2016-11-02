using TheDebateApp.Dtos;
using System.Collections.Generic;

namespace TheDebateApp.Services
{
    public interface IArchitectureService
    {
        ArchitectureAddOrUpdateResponseDto AddOrUpdate(ArchitectureAddOrUpdateRequestDto request);
        ICollection<ArchitectureDto> Get();
        ArchitectureDto GetById(int id);
        dynamic Remove(int id);
    }
}
