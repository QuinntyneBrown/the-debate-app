using System;
using System.Collections.Generic;
using TheDebateApp.Data;
using TheDebateApp.Dtos;
using System.Data.Entity;
using System.Linq;
using TheDebateApp.Models;

namespace TheDebateApp.Services
{
    public class ArchitectureItemService : IArchitectureItemService
    {
        public ArchitectureItemService(IUow uow, ICacheProvider cacheProvider)
        {
            _uow = uow;
            _repository = uow.ArchitectureItems;
            _cache = cacheProvider.GetCache();
        }

        public ArchitectureItemAddOrUpdateResponseDto AddOrUpdate(ArchitectureItemAddOrUpdateRequestDto request)
        {
            var entity = _repository.GetAll()
                .FirstOrDefault(x => x.Id == request.Id && x.IsDeleted == false);
            if (entity == null) _repository.Add(entity = new ArchitectureItem());
            entity.Name = request.Name;
            _uow.SaveChanges();
            return new ArchitectureItemAddOrUpdateResponseDto(entity);
        }

        public dynamic Remove(int id)
        {
            var entity = _repository.GetById(id);
            entity.IsDeleted = true;
            _uow.SaveChanges();
            return id;
        }

        public ICollection<ArchitectureItemDto> Get()
        {
            ICollection<ArchitectureItemDto> response = new HashSet<ArchitectureItemDto>();
            var entities = _repository.GetAll().Where(x => x.IsDeleted == false).ToList();
            foreach(var entity in entities) { response.Add(new ArchitectureItemDto(entity)); }    
            return response;
        }


        public ArchitectureItemDto GetById(int id)
        {
            return new ArchitectureItemDto(_repository.GetAll().Where(x => x.Id == id && x.IsDeleted == false).FirstOrDefault());
        }

        protected readonly IUow _uow;
        protected readonly IRepository<ArchitectureItem> _repository;
        protected readonly ICache _cache;
    }
}
