
"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Twitter, Instagram, Youtube, Send } from 'lucide-react';

const socialPlatforms = [
  { name: 'Facebook', icon: Facebook, url: 'https://facebook.com/phiquence' },
  { name: 'Twitter', icon: Twitter, url: 'https://twitter.com/phiquence' },
  { name: 'Instagram', icon: Instagram, url: 'https://instagram.com/phiquence' },
  { name: 'YouTube', icon: Youtube, url: 'https://youtube.com/phiquence' },
  { name: 'Telegram', icon: Send, url: 'https://t.me/phiquence' },
];

async function trackSocialClick(token: string, platform: string) {
    try {
        await fetch('/api/social/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ platform })
        });
    } catch (error) {
        console.error("Failed to track social click", error);
    }
}


export function SocialLinks() {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleClick = async (platform: string, url: string) => {
        if (user) {
            const token = await user.getIdToken();
            await trackSocialClick(token, platform);
             toast({
                title: "Thanks for sharing!",
                description: "Keep an eye out for a Mystery Box reward soon.",
            });
        }
        window.open(url, '_blank');
    }

    return (
        <div className="flex gap-4">
            {socialPlatforms.map(({name, icon: Icon, url}) => (
                 <button key={name} onClick={() => handleClick(name, url)} className="text-muted-foreground hover:text-primary transition-colors">
                    <Icon className="h-6 w-6" />
                    <span className="sr-only">{name}</span>
                </button>
            ))}
        </div>
    );
}
