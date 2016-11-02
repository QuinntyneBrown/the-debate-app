using TheDebateApp.Dtos;
using System.Collections.Generic;

namespace TheDebateApp.Services
{
    public interface IArchitectureItemService
    {
        ArchitectureItemAddOrUpdateResponseDto AddOrUpdate(ArchitectureItemAddOrUpdateRequestDto request);
        ICollection<ArchitectureItemDto> Get();
        ArchitectureItemDto GetById(int id);
        dynamic Remove(int id);
    }
}
