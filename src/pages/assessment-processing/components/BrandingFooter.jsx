import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const BrandingFooter = () => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Image
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200"
            alt="BSR DeepTech Launch project logo featuring modern geometric design with blue and teal gradient colors representing innovation and technology"
            className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
          />
          <div>
            <h4 className="font-heading font-semibold text-foreground text-sm md:text-base">
              BSR DeepTech Launch
            </h4>
            <p className="caption text-muted-foreground">
              Powered by Interreg Baltic Sea Region
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 caption text-muted-foreground">
          <Icon name="Shield" size={16} className="text-success" />
          <span>Secure AI Processing</span>
        </div>
      </div>
    </div>
  );
};

export default BrandingFooter;