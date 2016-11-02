using System;
using System.Collections.Generic;
using TheDebateApp.Data;
using TheDebateApp.Dtos;
using System.Data.Entity;
using System.Linq;
using TheDebateApp.Models;

namespace TheDebateApp.Services
{
    public class ArchitectureService : IArchitectureService
    {
        public ArchitectureService(IUow uow, ICacheProvider cacheProvider)
        {
            _uow = uow;
            _repository = uow.Architectures;
            _cache = cacheProvider.GetCache();
        }

        public ArchitectureAddOrUpdateResponseDto AddOrUpdate(ArchitectureAddOrUpdateRequestDto request)
        {
            var entity = _repository.GetAll()
                .FirstOrDefault(x => x.Id == request.Id && x.IsDeleted == false);
            if (entity == null) _repository.Add(entity = new Architecture());
            entity.Name = request.Name;
            _uow.SaveChanges();
            return new ArchitectureAddOrUpdateResponseDto(entity);
        }

        public dynamic Remove(int id)
        {
            var entity = _repository.GetById(id);
            entity.IsDeleted = true;
            _uow.SaveChanges();
            return id;
        }

        public ICollection<ArchitectureDto> Get()
        {
            ICollection<ArchitectureDto> response = new HashSet<ArchitectureDto>();
            var entities = _repository.GetAll().Where(x => x.IsDeleted == false).ToList();
            foreach(var entity in entities) { response.Add(new ArchitectureDto(entity)); }    
            return response;
        }


        public ArchitectureDto GetById(int id)
        {
            return new ArchitectureDto(_repository.GetAll().Where(x => x.Id == id && x.IsDeleted == false).FirstOrDefault());
        }

        protected readonly IUow _uow;
        protected readonly IRepository<Architecture> _repository;
        protected readonly ICache _cache;
    }
}
