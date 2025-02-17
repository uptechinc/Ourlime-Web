import { formatDate } from '@/helpers/Posts';
import { SocialPosts } from '@/types/global';
import {
	Image,
	Avatar,
	AvatarGroup,
	Skeleton,
	Textarea,
} from '@nextui-org/react';
import { Heart, MessageCircle, Share } from 'lucide-react';
import React from 'react';
import ReactPlayer from 'react-player';

export default function TextPosts({
	socialPosts,
}: {
	socialPosts: SocialPosts[];
}) {
	/**
	 * Filters the `socialPosts` array to only include posts that have non-empty content.
	 * This is used to display only text-based posts in the `TextPosts` component.
	 */
	const photosPosts = socialPosts.filter(
		(post) => post.postImage !== undefined && post.postImage !== ''
	);

	return (
		<div>
			{photosPosts.length === 0 ? (
				<p className="text-center">No text posts found.</p>
			) : (
				photosPosts.map((post, index) => (
					<div
						key={index}
						className="mb-5 mt-5 flex flex-col justify-center rounded-xl bg-white p-5 shadow-md"
					>
						<div className="flex items-center gap-3">
							<div className="h-12 w-12 overflow-hidden rounded-full">
								<Avatar
									src={post.profileImage?.toString()}
									alt="profile picture"
									className="h-full w-full object-cover"
									showFallback
									fallback={<Skeleton className="h-full w-full" />}
								/>
							</div>
							<p className="text-xl font-semibold">{post.username}</p>
							<p className="ml-auto text-base text-gray-500">
								{formatDate(post.time)}
							</p>
						</div>
						<div className="mt-3">
							<p className="text-base">{post.content}</p>
							<div className="flex flex-wrap">
								{post.video && (
									<ReactPlayer
										url={post.video}
										controls
										width="100%"
										height="15rem"
									/>
								)}
								{post.postImage && (
									<div className="mt-3 h-full w-full">
										<Image
											src={post.postImage.toString()}
											alt="post image"
											className="h-full w-full"
										/>
									</div>
								)}
							</div>
							<div className="mt-3 flex items-center gap-3">
								<div className="text-base">
									<Heart className="cursor-pointer hover:text-red-500" />{' '}
									{post.likes}
								</div>
								<div className="text-base">
									<MessageCircle className="cursor-pointer hover:text-gray-500" />{' '}
									{post.comments}
								</div>
								<div className="cursor-pointer text-base">
									<Share className="cursor-pointer hover:text-blue-500" /> Share
								</div>
								<div className="ml-auto flex flex-row-reverse">
									<AvatarGroup className="cursor-pointer" isBordered max={3}>
										{[...Array(100)].map((_, idx) => (
											<Avatar
												key={idx}
												src="/images/home/userPicture.png"
												alt="User profile picture"
												size="sm"
											/>
										))}
									</AvatarGroup>
								</div>
							</div>
							<form className="mt-2 w-full">
								<Textarea
									name="comment"
									placeholder="Type your comment here..."
									className="h-12 w-full"
								/>
							</form>
						</div>
					</div>
				))
			)}
		</div>
	);
}
