using TheDebateApp.Dtos;
using System.Collections.Generic;

namespace TheDebateApp.Services
{
    public interface IDigitalAssetService
    {
        DigitalAssetAddOrUpdateResponseDto AddOrUpdate(DigitalAssetAddOrUpdateRequestDto request);
        ICollection<DigitalAssetDto> Get();
        DigitalAssetDto GetById(int id);
        dynamic Remove(int id);
    }
}
